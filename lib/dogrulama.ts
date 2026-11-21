// ─────────────────────────────────────────────────────────────
// dogrulama.ts — E-posta doğrulama
//
// 1) Kayıtta rastgele bir bilet (token) üretilir, parmak izi veritabanına yazılır.
// 2) Bilet bir link içinde e-postaya gönderilir: /api/eposta-dogrula?token=...
// 3) Linke tıklanınca parmak izi eşleşirse hesap "doğrulandı" olur, bilet silinir.
// Bilet 24 saat geçerli; tek kullanımlık; aynı hesaba dakikada en fazla 1 link gider.
// ─────────────────────────────────────────────────────────────

import { createHash, randomBytes } from "crypto";
import { and, eq, gt, sql } from "drizzle-orm";
import { db } from "./db";
import { epostaDogrulamalari, kullanicilar } from "./db/sema";
import { epostaGonder, epostaSablonu } from "./eposta";

const GECERLILIK_SAAT = 24;
const BEKLEME_SN = 60;
const parmakIzi = (token: string) => createHash("sha256").update(token).digest("hex");

/**
 * Linklerin başındaki adres. Yayında MUTLAKA .env'deki SITE_ADRESI kullanılır
 * (örn. https://www.saywright.org). İsteğin geldiği adrese güvenmiyoruz; çünkü biri
 * sahte bir "Host" bilgisiyle linki kendi sitesine yönlendirmeye çalışabilir.
 */
export function siteKoku(istek: Request) {
  const env = process.env.SITE_ADRESI?.replace(/\/+$/, "");
  if (env) return env;
  if (process.env.NODE_ENV === "production") throw new Error("SITE_ADRESI tanımlı değil (.env)");
  return new URL(istek.url).origin;
}

export type GonderimSonucu = { tamam: true; gelistirmeLinki?: string } | { tamam: false; hata: string };

export async function dogrulamaGonder(k: { id: string; ad: string; eposta: string }, kok: string): Promise<GonderimSonucu> {
  // Çok sık istek (spam) koruması
  const [son] = await db
    .select({ id: epostaDogrulamalari.kullaniciId })
    .from(epostaDogrulamalari)
    .where(and(eq(epostaDogrulamalari.kullaniciId, k.id), gt(epostaDogrulamalari.olusturma, sql`now() - make_interval(secs => ${BEKLEME_SN})`)))
    .limit(1);
  if (son) return { tamam: false, hata: "Az önce bir link gönderdik. Yenisini istemek için 1 dakika bekle." };

  // Eski linkler geçersiz olsun, sadece en yenisi çalışsın
  await db.delete(epostaDogrulamalari).where(eq(epostaDogrulamalari.kullaniciId, k.id));
  const token = randomBytes(32).toString("hex");
  await db.insert(epostaDogrulamalari).values({
    tokenHash: parmakIzi(token),
    kullaniciId: k.id,
    bitis: sql`now() + make_interval(hours => ${GECERLILIK_SAAT})`,
  });

  const link = `${kok}/api/eposta-dogrula?token=${token}`;
  const sonuc = await epostaGonder({
    kime: k.eposta,
    konu: "Saywright · E-posta adresini doğrula",
    metin: `Merhaba ${k.ad}, e-posta adresini doğrulamak için bu bağlantıyı aç: ${link} (${GECERLILIK_SAAT} saat geçerli)`,
    html: epostaSablonu({
      baslik: `Hoş geldin ${k.ad}! 👋`,
      metin: "Saywright hesabını kullanmaya başlamak için e-posta adresini doğrulaman gerekiyor. Aşağıdaki butona tıklaman yeterli.",
      butonMetni: "E-postamı doğrula",
      link,
      altNot: `Bu bağlantı ${GECERLILIK_SAAT} saat geçerli. Saywright'a sen kayıt olmadıysan bu e-postayı görmezden gelebilirsin.`,
    }),
  });

  if (sonuc.gonderildi) return { tamam: true };
  if (sonuc.gelistirme && process.env.NODE_ENV !== "production") return { tamam: true, gelistirmeLinki: link };
  return { tamam: false, hata: sonuc.gonderildi === false && sonuc.hata ? sonuc.hata : "E-posta gönderilemedi." };
}

/** Linkteki bileti kontrol eder. Geçerliyse hesabı doğrular ve true döner. */
export async function dogrulamaTamamla(token: string) {
  if (!/^[0-9a-f]{64}$/.test(token)) return false;
  // Sil-ve-döndür tek komut: aynı link iki kez kullanılamaz
  const [b] = await db
    .delete(epostaDogrulamalari)
    .where(and(eq(epostaDogrulamalari.tokenHash, parmakIzi(token)), gt(epostaDogrulamalari.bitis, sql`now()`)))
    .returning({ kullaniciId: epostaDogrulamalari.kullaniciId });
  if (!b) return false;
  await db
    .update(kullanicilar)
    .set({ epostaDogrulandi: sql`coalesce(${kullanicilar.epostaDogrulandi}, now())` })
    .where(eq(kullanicilar.id, b.kullaniciId));
  return true;
}
