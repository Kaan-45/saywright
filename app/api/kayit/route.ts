// POST /api/kayit — yeni üye kaydı
import { dogrulamaGonder, siteKoku } from "@/lib/dogrulama";
import { oturumAc, sifreHashle } from "@/lib/oturum";
import { kullaniciBulEposta, kullaniciOlustur } from "@/lib/veritabani";

export async function POST(istek: Request) {
  const { ad, eposta, sifre } = (await istek.json()) as Record<string, string>;
  const temizEposta = String(eposta ?? "").trim().toLowerCase();
  const temizAd = String(ad ?? "").trim();

  // Sunucu tarafında da kontrol ediyoruz: tarayıcıdaki kontroller atlatılabilir.
  if (temizAd.length < 2) return Response.json({ hata: "Adını yazar mısın?" }, { status: 400 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(temizEposta))
    return Response.json({ hata: "Geçerli bir e-posta adresi gir." }, { status: 400 });
  if (String(sifre ?? "").length < 8)
    return Response.json({ hata: "Şifre en az 8 karakter olmalı." }, { status: 400 });
  if (await kullaniciBulEposta(temizEposta))
    return Response.json({ hata: "Bu e-posta ile zaten bir hesap var. Giriş yapmayı dene." }, { status: 409 });

  const kullanici = await kullaniciOlustur(temizAd, temizEposta, sifreHashle(sifre));
  await oturumAc(kullanici.id);

  // Doğrulama e-postası. Gönderilemese bile kayıt tamamdır; panelden "tekrar gönder" denebilir.
  const gonderim = await dogrulamaGonder(kullanici, siteKoku(istek)).catch(() => null);
  return Response.json({ tamam: true, gelistirmeLinki: gonderim?.tamam ? gonderim.gelistirmeLinki : undefined });
}
