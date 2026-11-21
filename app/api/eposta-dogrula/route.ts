// ─────────────────────────────────────────────────────────────
// /api/eposta-dogrula
//   GET  ?token=...  → e-postadaki link buraya gelir; doğrular ve sonuç sayfasına yönlendirir
//   POST             → (giriş yapmış kullanıcı) yeni doğrulama linki gönderir
// ─────────────────────────────────────────────────────────────

import { dogrulamaGonder, dogrulamaTamamla, siteKoku } from "@/lib/dogrulama";
import { mevcutKullanici } from "@/lib/oturum";

export async function GET(istek: Request) {
  const token = new URL(istek.url).searchParams.get("token") ?? "";
  const tamam = await dogrulamaTamamla(token);
  return Response.redirect(new URL(`/eposta-dogrula?durum=${tamam ? "tamam" : "gecersiz"}`, istek.url), 303);
}

export async function POST(istek: Request) {
  const k = await mevcutKullanici();
  if (!k) return Response.json({ hata: "Oturumun kapanmış, tekrar giriş yap." }, { status: 401 });
  if (k.epostaDogrulandi) return Response.json({ hata: "E-posta adresin zaten doğrulanmış." }, { status: 400 });

  const sonuc = await dogrulamaGonder(k, siteKoku(istek));
  if (!sonuc.tamam) return Response.json({ hata: sonuc.hata }, { status: 429 });
  return Response.json({ eposta: k.eposta, gelistirmeLinki: sonuc.gelistirmeLinki });
}
