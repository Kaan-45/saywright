// ─────────────────────────────────────────────────────────────
// veritabani.ts — Kullanıcıları, oturumları ve siteleri saklar
//
// Artık veriler Neon'daki PostgreSQL veritabanında (lib/db/).
// Önceki JSON dosyası sürümüyle AYNI fonksiyonlar dışarıya açılıyor;
// bu yüzden sayfalarda ve API'lerde hiçbir şeyi değiştirmemiz gerekmedi.
// ─────────────────────────────────────────────────────────────

import { and, desc, eq, gt, lt, ne, sql } from "drizzle-orm";
import type { MagazaAyarlari } from "@/templates/magaza/tipler";
import { db } from "./db";
import { kullanicilar, oturumlar, siteler, type SohbetMesaji } from "./db/sema";
import type { PlanKodu } from "./planlar";
import { slugHatasi, slugOlustur } from "./yardimci";

export type { SohbetMesaji };

export type Kullanici = {
  id: string;
  ad: string;
  eposta: string;
  sifreHash: string;
  plan: PlanKodu;
  olusturulanSiteSayisi: number;
  rol: "kullanici" | "admin";
  epostaDogrulandi: string | null; // boşsa e-posta henüz doğrulanmadı
  kayitTarihi: string;
};

export type Oturum = { token: string; kullaniciId: string; bitis: string };

export type Site = {
  id: string;
  kullaniciId: string;
  ayarlar: MagazaAyarlari | null;
  mesajlar: SohbetMesaji[];
  yapayZekaMesajSayisi: number;
  olusturma: string;
  guncelleme: string;
  slug: string | null;
  yayinda: boolean;
  surum: number;
  yayinTarihi: string | null;
  yayinOnayi: string | null; // Saywright admini onayladıysa dolu
  alanAdi: string | null; // bağlanmış kendi alan adı
};

// Veritabanı tarihleri Date nesnesi olarak döndürür; uygulamanın geri kalanı metin (ISO) bekliyor.
const kullaniciDonustur = (k: typeof kullanicilar.$inferSelect): Kullanici => ({
  ...k,
  kayitTarihi: k.kayitTarihi.toISOString(),
  epostaDogrulandi: k.epostaDogrulandi?.toISOString() ?? null,
});
const siteDonustur = (s: typeof siteler.$inferSelect): Site => ({
  ...s,
  ayarlar: s.ayarlar ?? null,
  olusturma: s.olusturma.toISOString(),
  guncelleme: s.guncelleme.toISOString(),
  yayinTarihi: s.yayinTarihi?.toISOString() ?? null,
  yayinOnayi: s.yayinOnayi?.toISOString() ?? null,
});

// ── Kullanıcılar ──
export async function kullaniciBulEposta(eposta: string) {
  const [k] = await db.select().from(kullanicilar).where(eq(kullanicilar.eposta, eposta)).limit(1);
  return k ? kullaniciDonustur(k) : null;
}

export async function kullaniciBulId(id: string) {
  const [k] = await db.select().from(kullanicilar).where(eq(kullanicilar.id, id)).limit(1);
  return k ? kullaniciDonustur(k) : null;
}

export async function kullaniciOlustur(ad: string, eposta: string, sifreHash: string) {
  const [k] = await db.insert(kullanicilar).values({ ad, eposta, sifreHash }).returning();
  return kullaniciDonustur(k);
}

export async function kullaniciGuncelle(id: string, degisiklik: { ad?: string; sifreHash?: string; plan?: PlanKodu }) {
  const [k] = await db.update(kullanicilar).set(degisiklik).where(eq(kullanicilar.id, id)).returning();
  return k ? kullaniciDonustur(k) : null;
}

/** Hesabı kalıcı olarak siler. Siteleri ve oturumları da (cascade sayesinde) otomatik silinir. */
export async function kullaniciSil(id: string) {
  await db.delete(kullanicilar).where(eq(kullanicilar.id, id));
}

// ── Oturumlar ──
/** Bu cihaz hariç diğer tüm cihazlardaki oturumları kapatır. Kaç oturum kapandığını döner. */
export async function digerOturumlariSil(kullaniciId: string, korunacakToken: string) {
  const silinen = await db
    .delete(oturumlar)
    .where(and(eq(oturumlar.kullaniciId, kullaniciId), ne(oturumlar.token, korunacakToken)))
    .returning({ token: oturumlar.token });
  return silinen.length;
}

export async function oturumKaydet(o: Oturum) {
  await db.delete(oturumlar).where(lt(oturumlar.bitis, new Date())); // süresi dolanları temizle
  await db.insert(oturumlar).values({ token: o.token, kullaniciId: o.kullaniciId, bitis: new Date(o.bitis) });
}

export async function oturumBul(token: string): Promise<Oturum | null> {
  const [o] = await db
    .select()
    .from(oturumlar)
    // "Şu an"ı veritabanına soruyoruz (now()). Sayfa çizilirken new Date() kullanmak
    // Next.js 16'da önceden hazırlamayı (prerender) bozuyor.
    .where(and(eq(oturumlar.token, token), gt(oturumlar.bitis, sql`now()`)))
    .limit(1);
  return o ? { ...o, bitis: o.bitis.toISOString() } : null;
}

export async function oturumSil(token: string) {
  await db.delete(oturumlar).where(eq(oturumlar.token, token));
}

// ── Siteler ──
export async function kullanicininSiteleri(kullaniciId: string) {
  const liste = await db
    .select()
    .from(siteler)
    .where(eq(siteler.kullaniciId, kullaniciId))
    .orderBy(desc(siteler.guncelleme));
  return liste.map(siteDonustur);
}

export async function siteBul(id: string) {
  // Geçersiz biçimdeki id'ler (uuid olmayan) veritabanına hiç gitmesin, hata vermesin
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const [s] = await db.select().from(siteler).where(eq(siteler.id, id)).limit(1);
  return s ? siteDonustur(s) : null;
}

/**
 * Hak kontrolü ve site oluşturma.
 * Sayacı "hakkı varsa artır" şeklinde TEK bir komutla güncelliyoruz; böylece aynı anda
 * gelen iki istek hakkı aşamaz (veritabanı bunu sıraya koyar).
 */
export async function siteOlustur(kullaniciId: string, siteHakki: number) {
  const guncellenen = await db
    .update(kullanicilar)
    .set({ olusturulanSiteSayisi: sql`${kullanicilar.olusturulanSiteSayisi} + 1` })
    .where(and(eq(kullanicilar.id, kullaniciId), lt(kullanicilar.olusturulanSiteSayisi, siteHakki)))
    .returning({ id: kullanicilar.id });
  if (guncellenen.length === 0) return null; // hak kalmamış

  const [s] = await db.insert(siteler).values({ kullaniciId }).returning();
  return siteDonustur(s);
}

/**
 * Admin panelinden gelen kayıt: sadece ayarları değiştirir, yapay zeka mesaj hakkından düşmez.
 * beklenenSurum: panel açıldığından beri başka bir değişiklik (örn. yeni sipariş → stok düştü)
 * olduysa kaydetme; "cakisma" dön ki sahibin eski verisi yeni stoğu ezmesin.
 */
export async function siteAyarKaydet(id: string, ayarlar: MagazaAyarlari, beklenenSurum: number) {
  const [s] = await db
    .update(siteler)
    .set({ ayarlar, guncelleme: new Date(), surum: sql`${siteler.surum} + 1` })
    .where(and(eq(siteler.id, id), eq(siteler.surum, beklenenSurum)))
    .returning();
  return s ? siteDonustur(s) : ("cakisma" as const);
}

/** Bu adres (slug) başka bir site tarafından kullanılıyor mu? */
export async function slugKullaniliyorMu(slug: string, haricSiteId?: string) {
  const [s] = await db.select({ id: siteler.id }).from(siteler).where(eq(siteler.slug, slug)).limit(1);
  return !!s && s.id !== haricSiteId;
}

/** Mağaza adından boşta olan bir adres önerir ("lavmira-mum", doluysa "lavmira-mum-2" …). */
export async function adresOner(siteId: string, magazaAdi: string) {
  const temel = slugOlustur(magazaAdi) || "magazam";
  let aday = temel.length >= 3 ? temel : `${temel}-magaza`;
  for (let i = 2; (await slugKullaniliyorMu(aday, siteId)) || slugHatasi(aday); i++) aday = `${temel}-${i}`;
  return aday;
}

/**
 * Yayın durumunu ve adresi günceller.
 * Aynı anda başka biri aynı adresi alırsa veritabanının "benzersiz" kuralı yakalar → null döner.
 */
export async function siteYayinGuncelle(id: string, yayinda: boolean, slug: string) {
  try {
    const [s] = await db
      .update(siteler)
      .set({ yayinda, slug, yayinTarihi: yayinda ? sql`coalesce(${siteler.yayinTarihi}, now())` : null })
      .where(eq(siteler.id, id))
      .returning();
    return s ? siteDonustur(s) : null;
  } catch {
    return null;
  }
}

/** Yapay zeka cevabından sonra: ayarları değiştirir, mesajları ekler, mesaj sayacını 1 artırır. */
export async function siteGuncelle(id: string, ayarlar: MagazaAyarlari, yeniMesajlar: SohbetMesaji[]) {
  const [s] = await db
    .update(siteler)
    .set({
      ayarlar,
      // mevcut listenin sonuna ekle (|| = JSON listelerini birleştir)
      mesajlar: sql`${siteler.mesajlar} || ${JSON.stringify(yeniMesajlar)}::jsonb`,
      yapayZekaMesajSayisi: sql`${siteler.yapayZekaMesajSayisi} + 1`,
      surum: sql`${siteler.surum} + 1`,
      guncelleme: new Date(),
    })
    .where(eq(siteler.id, id))
    .returning();
  return s ? siteDonustur(s) : null;
}
