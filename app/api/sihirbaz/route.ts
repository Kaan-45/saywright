// ─────────────────────────────────────────────────────────────
// app/api/sihirbaz/route.ts — Yapay zekaya mesaj gönderme kapısı
//
// Kontroller (sırayla):
//   1) Giriş yapmış mı?   2) Site bu kullanıcının mı?
//   3) Mesaj hakkı kaldı mı?   4) Yapay zekaya sor, sonucu kaydet.
// Ayarları tarayıcıdan değil VERİTABANINDAN alıyoruz; böylece kimse
// sahte ayar gönderip sistemi kandıramaz.
// ─────────────────────────────────────────────────────────────

import Anthropic from "@anthropic-ai/sdk";
import { claudeYapayZeka } from "@/lib/claudeYapayZeka";
import { sahteYapayZeka } from "@/lib/sahteYapayZeka";
import { magazaOnbellegiTemizle } from "@/lib/magazalar";
import { dogrulamaZorunluMu } from "@/lib/demo";
import { DOGRULAMA_GEREKLI, mevcutKullanici } from "@/lib/oturum";
import { PLANLAR } from "@/lib/planlar";
import { siteBul, siteGuncelle } from "@/lib/veritabani";
import { VARSAYILAN_AYARLAR } from "@/templates/magaza/varsayilan";

const MAKS_MESAJ_UZUNLUGU = 1000;

export async function POST(istek: Request) {
  const kullanici = await mevcutKullanici();
  if (!kullanici) return Response.json({ hata: "Oturumun kapanmış, tekrar giriş yap." }, { status: 401 });
  if (dogrulamaZorunluMu(kullanici)) return Response.json({ hata: DOGRULAMA_GEREKLI }, { status: 403 });

  const { siteId, metin } = (await istek.json()) as { siteId: string; metin: string };
  const site = await siteBul(String(siteId));
  if (!site || site.kullaniciId !== kullanici.id) return Response.json({ hata: "Site bulunamadı." }, { status: 404 });

  const temizMetin = String(metin ?? "").trim().slice(0, MAKS_MESAJ_UZUNLUGU);
  if (!temizMetin) return Response.json({ hata: "Boş mesaj gönderilemez." }, { status: 400 });

  const sinir = PLANLAR[kullanici.plan].siteBasinaMesaj;
  if (site.yapayZekaMesajSayisi >= sinir)
    return Response.json({ hata: `Bu site için ${sinir} mesajlık hakkın doldu.` }, { status: 403 });

  const eski = site.ayarlar ?? VARSAYILAN_AYARLAR;
  let cevap;
  if (!process.env.ANTHROPIC_API_KEY) {
    cevap = sahteYapayZeka(eski, temizMetin);
    cevap.mesaj += "\n\n🧪 Demo modu: basit kurallarla çalışan yapay zeka. Hızlı seçenekleri de deneyebilirsin.";
  } else {
    try {
      cevap = await claudeYapayZeka(eski, temizMetin);
    } catch (hata) {
      console.error("Claude hatası:", hata);
      let mesaj = "Yapay zekaya ulaşırken bir sorun oldu, biraz sonra tekrar dene.";
      if (hata instanceof Anthropic.AuthenticationError) mesaj = "API anahtarı geçersiz görünüyor. .env.local dosyasını kontrol et.";
      else if (hata instanceof Anthropic.RateLimitError) mesaj = "Çok sık istek gönderildi, birkaç saniye bekleyip tekrar dene.";
      else if (hata instanceof Anthropic.APIError && hata.status === 400) mesaj = "İstek reddedildi (kredi bitmiş olabilir). Konsoldaki bakiyeni kontrol et.";
      // Hata durumunda hak düşmüyoruz
      return Response.json({ hata: mesaj }, { status: 502 });
    }
  }

  const guncel = await siteGuncelle(site.id, cevap.ayarlar, [
    { kimden: "musteri", metin: temizMetin },
    { kimden: "sihirbaz", metin: cevap.mesaj },
  ]);
  magazaOnbellegiTemizle(site.slug); // yayındaysa ziyaretçiler güncel hali görsün
  return Response.json({
    ayarlar: cevap.ayarlar,
    mesaj: cevap.mesaj,
    kalanMesaj: sinir - (guncel?.yapayZekaMesajSayisi ?? sinir),
  });
}
