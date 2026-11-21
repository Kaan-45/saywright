// ─────────────────────────────────────────────────────────────
// oturum.ts — Giriş/çıkış ve "şu an kim giriş yapmış?" sorusu
//
// Nasıl çalışır?
// 1) Giriş yapınca rastgele, tahmin edilemez bir "bilet" (token) üretiriz.
// 2) Bileti veritabanına ve tarayıcıya çerez (cookie) olarak kaydederiz.
// 3) Her istekte tarayıcı çerezi gönderir; biz de bileti veritabanında arayıp
//    kullanıcıyı buluruz.
// Çerez "httpOnly" olduğu için sayfadaki JavaScript onu okuyamaz (daha güvenli).
// ─────────────────────────────────────────────────────────────

import { cookies } from "next/headers";
import { randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { kullaniciBulId, oturumBul, oturumKaydet, oturumSil } from "./veritabani";

const CEREZ_ADI = "oturum";
const OTURUM_SURESI_GUN = 30;

// ── Şifreler ──
// scrypt: şifreyi geri çevrilemez bir "parmak izine" dönüştürür.
// "tuz" (salt) sayesinde aynı şifreler bile farklı parmak izi üretir.
export function sifreHashle(sifre: string) {
  const tuz = randomBytes(16).toString("hex");
  const hash = scryptSync(sifre, tuz, 64).toString("hex");
  return `${tuz}:${hash}`;
}

export function sifreDogruMu(sifre: string, kayitli: string) {
  const [tuz, hash] = kayitli.split(":");
  const deneme = scryptSync(sifre, tuz, 64);
  return timingSafeEqual(deneme, Buffer.from(hash, "hex"));
}

// ── Oturum ── (sadece Route Handler / Server Function içinden çağrılır)
export async function oturumAc(kullaniciId: string) {
  const token = randomBytes(32).toString("hex");
  const bitis = new Date(Date.now() + OTURUM_SURESI_GUN * 24 * 60 * 60 * 1000);
  await oturumKaydet({ token, kullaniciId, bitis: bitis.toISOString() });
  (await cookies()).set(CEREZ_ADI, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: bitis,
  });
}

export async function oturumKapat() {
  const cerezler = await cookies();
  const token = cerezler.get(CEREZ_ADI)?.value;
  if (token) await oturumSil(token);
  cerezler.delete(CEREZ_ADI);
}

/** Bu tarayıcının oturum biletini döndürür (şifre değiştirirken "bu cihaz hariç" demek için). */
export async function mevcutToken() {
  return (await cookies()).get(CEREZ_ADI)?.value ?? null;
}

/** E-postası doğrulanmamış kullanıcı kısıtlı bir işlem denediğinde gösterilen mesaj */
export const DOGRULAMA_GEREKLI = "Önce e-posta adresini doğrula. Gelen kutundaki linke tıkla ya da panelden yeni link iste.";

/** Giriş yapmış kullanıcıyı döndürür, yoksa null. */
export async function mevcutKullanici() {
  const token = (await cookies()).get(CEREZ_ADI)?.value;
  if (!token) return null;
  const oturum = await oturumBul(token);
  return oturum ? kullaniciBulId(oturum.kullaniciId) : null;
}
