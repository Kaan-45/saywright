// ─────────────────────────────────────────────────────────────
// sema.ts — Mağaza ayarlarının "kontrol şablonu" (Zod şeması)
//
// İki yerde kullanılıyor:
//  1) Claude'un cevabının şeklini belirlemek (yapay zeka bu şeklin dışına çıkamaz)
//  2) Admin panelinden gelen kayıtları sunucuda kontrol etmek
//
// İsteğe bağlı alanlar (eskiFiyat, stok, rozet...) burada "null olabilir"
// olarak tanımlı: Claude'un cevabında her alan her zaman bulunsun diye.
// Uygulamanın içinde ise null yerine "alan hiç yok" (undefined) kullanıyoruz;
// aşağıdaki iki fonksiyon bu dönüşümü yapıyor.
// ─────────────────────────────────────────────────────────────

import { z } from "zod";
import type { MagazaAyarlari } from "./tipler";

export const UrunSemasi = z.object({
  ad: z.string(),
  fiyat: z.number().describe("Türk lirası"),
  aciklama: z.string(),
  emoji: z.string().describe("Ürünü temsil eden tek bir emoji"),
  eskiFiyat: z.number().nullable().describe("İndirim varsa indirimden önceki fiyat, yoksa null"),
  rozet: z.string().nullable().describe('"Yeni", "Çok Satan" gibi kısa etiket, yoksa null'),
  stok: z.number().nullable().describe("Stok adedi, takip edilmiyorsa null"),
});

export const AyarSemasi = z.object({
  magazaAdi: z.string(),
  slogan: z.string(),
  kategori: z.string(),
  renk: z.object({
    ad: z.string(),
    ana: z.string().describe("Ana renk, 6 haneli hex kodu. Örn: #2563eb"),
    acik: z.string().describe("Ana rengin çok açık tonu, 6 haneli hex. Örn: #eff6ff"),
  }),
  urunler: z.array(UrunSemasi),
  bolumler: z.object({
    hakkimizda: z.boolean(),
    yorumlar: z.boolean(),
    sss: z.boolean(),
    iletisim: z.boolean(),
  }),
  hakkimizdaMetni: z.string(),
  kategoriler: z.array(z.string()).nullable().describe("Üst menüdeki kategori adları, yoksa null"),
  kampanya: z.string().nullable().describe("Vitrindeki kısa kampanya yazısı, yoksa null"),
  arkaPlan: z.string().nullable().describe("Sayfanın arka plan rengi, 6 haneli hex (açık bir ton). Müşteri istemedikçe aynen koru; yoksa null"),
  yaziRengi: z.string().nullable().describe("Ana yazı rengi, 6 haneli hex (koyu bir ton). Müşteri istemedikçe aynen koru; yoksa null"),
});

export type SemaAyarlari = z.infer<typeof AyarSemasi>;

const yoksaSil = <T,>(d: T | null | undefined) => (d === null ? undefined : d);

/** Şemadan gelen (null'lı) veriyi uygulamanın kullandığı şekle çevirir. */
export function semadanAyar(s: SemaAyarlari): MagazaAyarlari {
  return {
    ...s,
    urunler: s.urunler.map((u) => ({
      ...u,
      eskiFiyat: yoksaSil(u.eskiFiyat),
      rozet: yoksaSil(u.rozet),
      stok: yoksaSil(u.stok),
    })),
    kategoriler: yoksaSil(s.kategoriler),
    kampanya: yoksaSil(s.kampanya),
    arkaPlan: yoksaSil(s.arkaPlan),
    yaziRengi: yoksaSil(s.yaziRengi),
  };
}

/** Uygulamadaki ayarları şemanın beklediği (null'lı) şekle çevirir. */
export function ayardanSema(a: MagazaAyarlari): SemaAyarlari {
  return {
    ...a,
    urunler: a.urunler.map((u) => ({
      ...u,
      eskiFiyat: u.eskiFiyat ?? null,
      rozet: u.rozet ?? null,
      stok: u.stok ?? null,
    })),
    kategoriler: a.kategoriler ?? null,
    kampanya: a.kampanya ?? null,
    arkaPlan: a.arkaPlan ?? null,
    yaziRengi: a.yaziRengi ?? null,
  };
}

/** Şemanın kontrol edemediği kurallar. Sorun varsa Türkçe hata mesajı döner. */
export function ayarHatasi(a: MagazaAyarlari): string | null {
  const hex = /^#[0-9a-fA-F]{6}$/;
  if (!a.magazaAdi.trim()) return "Mağaza adı boş olamaz.";
  if (a.magazaAdi.length > 60) return "Mağaza adı en fazla 60 karakter olabilir.";
  if (!hex.test(a.renk.ana) || !hex.test(a.renk.acik)) return "Renkler #RRGGBB biçiminde olmalı.";
  if ((a.arkaPlan && !hex.test(a.arkaPlan)) || (a.yaziRengi && !hex.test(a.yaziRengi))) return "Renkler #RRGGBB biçiminde olmalı.";
  if (a.urunler.length > 200) return "En fazla 200 ürün eklenebilir.";
  const adlar = new Set<string>();
  for (const u of a.urunler) {
    if (!u.ad.trim()) return "Ürün adı boş olamaz.";
    if (u.ad.length > 80) return `"${u.ad.slice(0, 20)}…" ürün adı çok uzun (en fazla 80 karakter).`;
    const k = u.ad.trim().toLocaleLowerCase("tr");
    if (adlar.has(k)) return `"${u.ad}" adında iki ürün var. Ürün adları farklı olmalı.`;
    adlar.add(k);
    if (!(u.fiyat >= 0)) return `"${u.ad}" için fiyat 0 veya daha büyük olmalı.`;
    if (u.eskiFiyat !== undefined && !(u.eskiFiyat > u.fiyat))
      return `"${u.ad}" için eski fiyat, satış fiyatından büyük olmalı.`;
    if (u.stok !== undefined && !(Number.isInteger(u.stok) && u.stok >= 0))
      return `"${u.ad}" için stok 0 veya daha büyük bir tam sayı olmalı.`;
  }
  return null;
}
