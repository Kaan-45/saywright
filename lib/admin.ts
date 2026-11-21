// ─────────────────────────────────────────────────────────────
// admin.ts — Saywright süper admin paneli (/admin) için sunucu fonksiyonları
//
// GÜVENLİK: Adresi gizli tutmak koruma değildir (/admin'i herkes tahmin eder).
// Asıl koruma: her sayfa ve her işlem adminKullanici() ile "giriş yapmış mı VE
// rolü admin mi?" diye kontrol eder. Değilse sayfa "bulunamadı" gösterir.
// ─────────────────────────────────────────────────────────────

import { desc, eq, ilike, or, sql } from "drizzle-orm";
import { db } from "./db";
import { kullanicilar, siparisler, siteler, yayinTalepleri } from "./db/sema";
import { mevcutKullanici } from "./oturum";

/** Giriş yapmış kullanıcı admin ise onu döndürür, değilse null. */
export async function adminKullanici() {
  const k = await mevcutKullanici();
  return k?.rol === "admin" ? k : null;
}

/** Genel bakış sayıları */
export async function istatistikler() {
  const [kullanici] = await db
    .select({
      toplam: sql<number>`count(*)::int`,
      ucretsiz: sql<number>`count(*) filter (where ${kullanicilar.plan} = 'ucretsiz')::int`,
      pro: sql<number>`count(*) filter (where ${kullanicilar.plan} = 'pro')::int`,
      isletme: sql<number>`count(*) filter (where ${kullanicilar.plan} = 'isletme')::int`,
      sonHafta: sql<number>`count(*) filter (where ${kullanicilar.kayitTarihi} > now() - interval '7 days')::int`,
    })
    .from(kullanicilar);

  const [site] = await db
    .select({
      toplam: sql<number>`count(*)::int`,
      yayinda: sql<number>`count(*) filter (where ${siteler.yayinda})::int`,
      yapayZekaMesaji: sql<number>`coalesce(sum(${siteler.yapayZekaMesajSayisi}), 0)::int`,
    })
    .from(siteler);

  const [talep] = await db
    .select({
      bekleyen: sql<number>`count(*) filter (where ${yayinTalepleri.durum} = 'bekliyor')::int`,
      kazancKurus: sql<number>`coalesce(sum(${yayinTalepleri.tutarKurus}) filter (where ${yayinTalepleri.durum} = 'onaylandi'), 0)::int`,
    })
    .from(yayinTalepleri);

  const [siparis] = await db
    .select({
      toplam: sql<number>`count(*)::int`,
      ciroKurus: sql<number>`coalesce(sum(${siparisler.toplamKurus}) filter (where ${siparisler.durum} <> 'iptal'), 0)::bigint`,
    })
    .from(siparisler);

  return { kullanici, site, talep, siparis: { toplam: siparis.toplam, ciroKurus: Number(siparis.ciroKurus) } };
}

/** Kullanıcı listesi (arama: ad veya e-posta) */
export async function tumKullanicilar(arama: string) {
  const q = arama.trim();
  return db
    .select({
      id: kullanicilar.id,
      ad: kullanicilar.ad,
      eposta: kullanicilar.eposta,
      plan: kullanicilar.plan,
      rol: kullanicilar.rol,
      kayitTarihi: kullanicilar.kayitTarihi,
      siteSayisi: sql<number>`(select count(*) from ${siteler} where ${siteler.kullaniciId} = ${kullanicilar.id})::int`,
      yapayZekaMesaji: sql<number>`(select coalesce(sum(${siteler.yapayZekaMesajSayisi}), 0) from ${siteler} where ${siteler.kullaniciId} = ${kullanicilar.id})::int`,
    })
    .from(kullanicilar)
    .where(q ? or(ilike(kullanicilar.ad, `%${q}%`), ilike(kullanicilar.eposta, `%${q}%`)) : undefined)
    .orderBy(desc(kullanicilar.kayitTarihi))
    .limit(200);
}

/** Tüm siteler (sahibi ve sipariş sayısıyla) */
export async function tumSiteler() {
  return db
    .select({
      id: siteler.id,
      magazaAdi: sql<string | null>`${siteler.ayarlar}->>'magazaAdi'`,
      slug: siteler.slug,
      yayinda: siteler.yayinda,
      yayinOnayi: siteler.yayinOnayi,
      alanAdi: siteler.alanAdi,
      yapayZekaMesajSayisi: siteler.yapayZekaMesajSayisi,
      guncelleme: siteler.guncelleme,
      sahipAd: kullanicilar.ad,
      sahipEposta: kullanicilar.eposta,
      sahipPlan: kullanicilar.plan,
      siparisSayisi: sql<number>`(select count(*) from ${siparisler} where ${siparisler.siteId} = ${siteler.id})::int`,
    })
    .from(siteler)
    .innerJoin(kullanicilar, eq(kullanicilar.id, siteler.kullaniciId))
    .orderBy(desc(siteler.guncelleme))
    .limit(300);
}

/** Sorunlu bir siteyi yayından kaldırır ve onayını geri alır (sahibi tekrar talep göndermek zorunda). */
export async function siteAskiyaAl(siteId: string) {
  const [s] = await db
    .update(siteler)
    .set({ yayinda: false, yayinOnayi: null })
    .where(eq(siteler.id, siteId))
    .returning({ slug: siteler.slug });
  return s ?? null;
}

/** Satın alınıp bağlanan alan adını siteye yazar (boş = kaldır). Başka sitede kullanılıyorsa false. */
export async function siteAlanAdiAyarla(siteId: string, alanAdi: string | null) {
  try {
    await db.update(siteler).set({ alanAdi }).where(eq(siteler.id, siteId));
    return true;
  } catch {
    return false;
  }
}
