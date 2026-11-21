// ─────────────────────────────────────────────────────────────
// musteriler.ts — Mağaza müşterileri: hesaplar ve giriş oturumları
//
// Saywright üyeleriyle (site sahipleri) KARIŞMASIN diye ayrı tablolar ve
// ayrı bir çerez kullanıyoruz. Çerezin "path" değeri /m/<adres> olduğu için
// tarayıcı onu sadece O mağazanın sayfalarına gönderir: bir mağazada giriş
// yapan kişi, başka bir mağazada otomatik olarak giriş yapmış sayılmaz.
// ─────────────────────────────────────────────────────────────

import { randomBytes } from "crypto";
import { and, desc, eq, gt, lt, ne, sql } from "drizzle-orm";
import { cookies } from "next/headers";
import { db } from "./db";
import { magazaMusterileri, magazaOturumlari } from "./db/sema";

const CEREZ = "musteri_oturum";
const SURE_GUN = 30;
const cerezYolu = (slug: string) => `/m/${slug}`;

export type Musteri = {
  id: string;
  siteId: string;
  ad: string;
  eposta: string;
  telefon: string | null;
  kayitTarihi: string;
  kvkkOnayTarihi: string;
};

type Satir = typeof magazaMusterileri.$inferSelect;
// Şifre parmak izini (sifreHash) dışarı vermiyoruz; sadece giriş kontrolünde kullanılıyor.
const donustur = (m: Satir): Musteri => ({
  id: m.id,
  siteId: m.siteId,
  ad: m.ad,
  eposta: m.eposta,
  telefon: m.telefon,
  kayitTarihi: m.kayitTarihi.toISOString(),
  kvkkOnayTarihi: m.kvkkOnayTarihi.toISOString(),
});

// ── Hesaplar ──
export async function musteriBulEposta(siteId: string, eposta: string) {
  const [m] = await db
    .select()
    .from(magazaMusterileri)
    .where(and(eq(magazaMusterileri.siteId, siteId), eq(magazaMusterileri.eposta, eposta)))
    .limit(1);
  return m ?? null; // sifreHash dahil — sadece giriş/şifre kontrolü için
}

export async function musteriOlustur(v: { siteId: string; ad: string; eposta: string; sifreHash: string; telefon: string | null }) {
  try {
    const [m] = await db
      .insert(magazaMusterileri)
      .values({ ...v, kvkkOnayTarihi: new Date() })
      .returning();
    return donustur(m);
  } catch {
    return null; // aynı mağazada aynı e-posta zaten var (benzersizlik kuralı)
  }
}

export async function musteriGuncelle(id: string, degisiklik: { ad?: string; telefon?: string | null; sifreHash?: string }) {
  const [m] = await db.update(magazaMusterileri).set(degisiklik).where(eq(magazaMusterileri.id, id)).returning();
  return m ? donustur(m) : null;
}

export async function musteriSil(id: string) {
  await db.delete(magazaMusterileri).where(eq(magazaMusterileri.id, id));
}

/** Admin paneli için: bir mağazanın tüm müşterileri (en yeniler üstte) */
export async function siteninMusterileri(siteId: string) {
  const liste = await db
    .select()
    .from(magazaMusterileri)
    .where(eq(magazaMusterileri.siteId, siteId))
    .orderBy(desc(magazaMusterileri.kayitTarihi));
  return liste.map(donustur);
}

// ── Oturumlar ── (oturumAc/Kapat sadece Route Handler içinden çağrılır)
export async function musteriOturumAc(musteriId: string, siteId: string, slug: string) {
  const token = randomBytes(32).toString("hex");
  const bitis = new Date(Date.now() + SURE_GUN * 24 * 60 * 60 * 1000);
  await db.delete(magazaOturumlari).where(lt(magazaOturumlari.bitis, new Date()));
  await db.insert(magazaOturumlari).values({ token, musteriId, siteId, bitis });
  (await cookies()).set(CEREZ, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: cerezYolu(slug),
    expires: bitis,
  });
}

export async function musteriOturumKapat(slug: string) {
  const c = await cookies();
  const token = c.get(CEREZ)?.value;
  if (token) await db.delete(magazaOturumlari).where(eq(magazaOturumlari.token, token));
  c.set(CEREZ, "", { path: cerezYolu(slug), maxAge: 0 });
}

export async function musteriToken() {
  return (await cookies()).get(CEREZ)?.value ?? null;
}

/** Bu mağazada giriş yapmış müşteri (yoksa null). Başka mağazanın oturumu burada geçersizdir. */
export async function mevcutMusteri(siteId: string) {
  const token = await musteriToken();
  if (!token) return null;
  const [satir] = await db
    .select({ m: magazaMusterileri })
    .from(magazaOturumlari)
    .innerJoin(magazaMusterileri, eq(magazaOturumlari.musteriId, magazaMusterileri.id))
    .where(and(eq(magazaOturumlari.token, token), eq(magazaOturumlari.siteId, siteId), gt(magazaOturumlari.bitis, sql`now()`)))
    .limit(1);
  return satir ? { ...donustur(satir.m), sifreHash: satir.m.sifreHash } : null;
}

/** Şifre değişince: bu cihaz hariç diğer oturumları kapat */
export async function musteriDigerOturumlariSil(musteriId: string, token: string) {
  await db.delete(magazaOturumlari).where(and(eq(magazaOturumlari.musteriId, musteriId), ne(magazaOturumlari.token, token)));
}
