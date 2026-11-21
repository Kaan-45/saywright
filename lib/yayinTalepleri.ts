// ─────────────────────────────────────────────────────────────
// yayinTalepleri.ts — "Yayınla" talepleri: oluşturma, listeleme, onay ve ret
//
// Akış:
//   1) Müşteri yayın sihirbazında adresini, alan adını seçer → talep "bekliyor"
//   2) Ücretsiz paketteyse ekranda havale bilgileri ve ödeme kodu görür
//   3) Saywright admini ödemeyi ve içeriği kontrol eder → "onaylandi" ya da "reddedildi"
//   4) Onayda: paket yükselir (istendiyse), site otomatik yayına girer
// ─────────────────────────────────────────────────────────────

import { and, desc, eq, ne, sql } from "drizzle-orm";
import { db } from "./db";
import { kullanicilar, siteler, yayinTalepleri } from "./db/sema";
import type { PlanKodu } from "./planlar";

export type TalepDurumu = (typeof yayinTalepleri.$inferSelect)["durum"];

export type YayinTalebi = {
  id: string;
  kullaniciId: string;
  siteId: string;
  durum: TalepDurumu;
  slug: string;
  alanAdi: string | null;
  alanAdiTuru: "yeni" | "mevcut" | null;
  istenenPlan: Exclude<PlanKodu, "ucretsiz"> | null;
  tutarKurus: number;
  odemeKodu: string;
  adminNotu: string | null;
  olusturma: string;
  kararTarihi: string | null;
};

const donustur = (t: typeof yayinTalepleri.$inferSelect): YayinTalebi => ({
  ...t,
  olusturma: t.olusturma.toISOString(),
  kararTarihi: t.kararTarihi?.toISOString() ?? null,
});

export const TALEP_DURUMLARI: Record<TalepDurumu, { ad: string; renk: string }> = {
  bekliyor: { ad: "Onay bekliyor", renk: "bg-amber-100 text-amber-800" },
  onaylandi: { ad: "Onaylandı", renk: "bg-emerald-100 text-emerald-800" },
  reddedildi: { ad: "Reddedildi", renk: "bg-rose-100 text-rose-800" },
  iptal: { ad: "Geri çekildi", renk: "bg-zemin text-derin" },
};

/** Bu sitenin en son talebi (bekleyen ya da sonuçlanmış). */
export async function siteninSonTalebi(siteId: string) {
  const [t] = await db
    .select()
    .from(yayinTalepleri)
    .where(eq(yayinTalepleri.siteId, siteId))
    .orderBy(desc(yayinTalepleri.olusturma))
    .limit(1);
  return t ? donustur(t) : null;
}

/** Kullanıcının bu site HARİÇ kaç sitesi yayın onaylı? (Pro'da 1 site hakkı var) */
export async function onayliSiteSayisi(kullaniciId: string, haricSiteId: string) {
  const [r] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(siteler)
    .where(and(eq(siteler.kullaniciId, kullaniciId), ne(siteler.id, haricSiteId), sql`${siteler.yayinOnayi} is not null`));
  return r?.n ?? 0;
}

/** Yeni talep. Aynı sitenin zaten bekleyen bir talebi varsa (benzersizlik kuralı) null döner. */
export async function talepOlustur(v: {
  kullaniciId: string;
  siteId: string;
  slug: string;
  alanAdi: string | null;
  alanAdiTuru: "yeni" | "mevcut" | null;
  istenenPlan: "pro" | "isletme" | null;
  tutarKurus: number;
  odemeKodu: string;
}) {
  try {
    const [t] = await db.insert(yayinTalepleri).values(v).returning();
    return donustur(t);
  } catch {
    return null;
  }
}

/** Müşteri bekleyen talebini geri çeker. */
export async function talepIptal(talepId: string, kullaniciId: string) {
  const r = await db
    .update(yayinTalepleri)
    .set({ durum: "iptal", kararTarihi: new Date() })
    .where(and(eq(yayinTalepleri.id, talepId), eq(yayinTalepleri.kullaniciId, kullaniciId), eq(yayinTalepleri.durum, "bekliyor")))
    .returning({ id: yayinTalepleri.id });
  return r.length > 0;
}

// ── Saywright admini için ──

/** Tüm talepler: bekleyenler en üstte, sonra en yeniler. Kullanıcı ve mağaza bilgisiyle. */
export async function talepleriListele() {
  const liste = await db
    .select({
      talep: yayinTalepleri,
      kullaniciAd: kullanicilar.ad,
      kullaniciEposta: kullanicilar.eposta,
      kullaniciPlan: kullanicilar.plan,
      magazaAdi: sql<string | null>`${siteler.ayarlar}->>'magazaAdi'`,
      urunSayisi: sql<number>`coalesce(jsonb_array_length(${siteler.ayarlar}->'urunler'), 0)::int`,
    })
    .from(yayinTalepleri)
    .innerJoin(kullanicilar, eq(kullanicilar.id, yayinTalepleri.kullaniciId))
    .innerJoin(siteler, eq(siteler.id, yayinTalepleri.siteId))
    .orderBy(sql`(${yayinTalepleri.durum} = 'bekliyor') desc`, desc(yayinTalepleri.olusturma))
    .limit(200);
  return liste.map((r) => ({ ...r, talep: donustur(r.talep) }));
}

export type OnaySonucu =
  | { tur: "tamam"; eskiSlug: string | null; yeniSlug: string }
  | { tur: "bulunamadi" }
  | { tur: "slug_dolu" };

/**
 * Talebi onaylar: paketi yükseltir (istendiyse) ve siteyi yayına alır.
 * Önce talebi "bekliyor → onaylandi" yaparak kilitleriz; böylece iki admin aynı anda
 * onaylasa bile işlem bir kez yapılır. Site güncellenemezse talebi geri "bekliyor" yaparız.
 */
export async function talepOnayla(talepId: string, adminNotu: string | null): Promise<OnaySonucu> {
  const [t] = await db
    .update(yayinTalepleri)
    .set({ durum: "onaylandi", kararTarihi: new Date(), adminNotu })
    .where(and(eq(yayinTalepleri.id, talepId), eq(yayinTalepleri.durum, "bekliyor")))
    .returning();
  if (!t) return { tur: "bulunamadi" };

  const geriAl = () =>
    db.update(yayinTalepleri).set({ durum: "bekliyor", kararTarihi: null, adminNotu: null }).where(eq(yayinTalepleri.id, t.id));

  const [eski] = await db.select({ slug: siteler.slug }).from(siteler).where(eq(siteler.id, t.siteId)).limit(1);
  try {
    const guncel = await db
      .update(siteler)
      .set({
        slug: t.slug,
        yayinda: true,
        yayinOnayi: sql`now()`,
        yayinTarihi: sql`coalesce(${siteler.yayinTarihi}, now())`,
      })
      .where(eq(siteler.id, t.siteId))
      .returning({ id: siteler.id });
    if (guncel.length === 0) {
      await geriAl();
      return { tur: "bulunamadi" };
    }
  } catch {
    // Benzersizlik kuralı: bu adresi bu arada başka bir mağaza almış
    await geriAl();
    return { tur: "slug_dolu" };
  }

  if (t.istenenPlan) await db.update(kullanicilar).set({ plan: t.istenenPlan }).where(eq(kullanicilar.id, t.kullaniciId));
  return { tur: "tamam", eskiSlug: eski?.slug ?? null, yeniSlug: t.slug };
}

/** Talebi reddeder. Sebep müşteriye yayın sihirbazında gösterilir. */
export async function talepReddet(talepId: string, sebep: string) {
  const r = await db
    .update(yayinTalepleri)
    .set({ durum: "reddedildi", kararTarihi: new Date(), adminNotu: sebep })
    .where(and(eq(yayinTalepleri.id, talepId), eq(yayinTalepleri.durum, "bekliyor")))
    .returning({ id: yayinTalepleri.id });
  return r.length > 0;
}
