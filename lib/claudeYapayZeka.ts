// ─────────────────────────────────────────────────────────────
// claudeYapayZeka.ts — Gerçek yapay zeka (Claude API)
//
// sahteYapayZeka.ts ile AYNI işi yapar:
//   (eski ayarlar + müşterinin mesajı) → (yeni ayarlar + cevap)
// Fark: kurallar yerine Claude metni gerçekten anlıyor.
//
// ⚠️ Bu dosya SADECE sunucuda çalışır (app/api/... içinden çağrılır).
// API anahtarı .env.local dosyasından okunur, tarayıcıya hiç gitmez.
// ─────────────────────────────────────────────────────────────

import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";
import type { MagazaAyarlari } from "@/templates/magaza/tipler";
import { AyarSemasi, ayardanSema, semadanAyar } from "@/templates/magaza/sema";
import type { YapayZekaCevabi } from "./sahteYapayZeka";

// Kullanılacak model. Daha ucuz/hızlı istersen "claude-sonnet-5-5"
// veya "claude-haiku-5-5" yazabilirsin.
const MODEL = "claude-opus-5-5";

// Claude'un cevabının şekli: ayarların tamamı + müşteriye kısa mesaj.
// "Structured outputs" sayesinde Claude bu şeklin DIŞINA çıkamaz.
const CevapSemasi = z.object({
  ayarlar: AyarSemasi,
  mesaj: z.string().describe("Müşteriye ne değiştirdiğini anlatan kısa Türkçe cevap"),
});

// Sistem talimatı: Claude'a görevini anlatıyoruz.
const TALIMAT = `Sen "Saywright" adlı bir web sitesi oluşturma aracının asistanısın.
Müşteri, alışveriş sitesinin nasıl olmasını istediğini Türkçe anlatıyor.
Sana sitenin MEVCUT ayarları (JSON) ve müşterinin yeni mesajı verilecek.

Görevin:
- Ayarları müşterinin isteğine göre güncelleyip TAMAMINI geri döndürmek.
- Sadece müşterinin istediği şeyleri değiştir; bahsetmediği alanları olduğu gibi bırak.
  Özellikle mevcut ürünlerin stok, eskiFiyat ve rozet değerlerini, müşteri istemedikçe aynen koru
  (müşteri bunları admin panelinden kendisi girmiş olabilir).
- Müşteri bir kategori söyleyip ürün vermezse o kategoriye uygun 4-8 gerçekçi ürün uydur (Türkçe ad, makul TL fiyatı, kısa açıklama, uygun emoji).
  Yeni ürünlerde stok null olsun; eskiFiyat'ı sadece indirim istenirse veya vitrini canlandırmak için birkaç üründe kullan.
- Ürün adları birbirinden farklı olsun.
- Renk istenirse "ana" için doygun bir hex, "acik" için aynı rengin çok açık tonunu seç (6 haneli hex).
- Mağaza adı verilmemişse ve ad hâlâ "Mağazam" ise, kategoriye uygun yaratıcı bir Türkçe ad öner.
- "kategoriler" menüde görünen 5-8 kısa kategori adı olsun; "kampanya" vitrindeki kısa kampanya cümlesi.
- Bütün site metinleri Türkçe olsun.
- "mesaj" alanında müşteriye samimi ve kısa (1-3 cümle) olarak ne yaptığını anlat.`;

const client = new Anthropic(); // anahtarı ANTHROPIC_API_KEY ortam değişkeninden kendisi okur

export async function claudeYapayZeka(eski: MagazaAyarlari, metin: string): Promise<YapayZekaCevabi> {
  const cevap = await client.beta.messages.parse({
    model: MODEL,
    max_tokens: 16000,
    system: TALIMAT,
    // Bu iş basit bir "metni anla, JSON doldur" işi; düşük efor yeterli ve daha hızlı/ucuz.
    output_config: { effort: "low", format: betaZodOutputFormat(CevapSemasi) },
    // Claude nadiren bir isteği reddederse, otomatik olarak başka bir modelle tekrar dener.
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    messages: [
      {
        role: "user",
        content: `MEVCUT AYARLAR:\n${JSON.stringify(ayardanSema(eski), null, 2)}\n\nMÜŞTERİNİN MESAJI:\n${metin}`,
      },
    ],
  });

  if (cevap.stop_reason === "refusal" || !cevap.parsed_output) {
    return { ayarlar: eski, mesaj: "Bu isteği işleyemedim, lütfen farklı bir şekilde anlatır mısın?" };
  }
  return { ayarlar: semadanAyar(cevap.parsed_output.ayarlar), mesaj: cevap.parsed_output.mesaj };
}
