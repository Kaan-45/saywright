// ─────────────────────────────────────────────────────────────
// demoSecenekleri.ts — Sohbet ekranındaki "Hızlı seçenekler"
//
// Yazmak yerine tıklayarak siteyi değiştirmek için hazır seçenekler:
// mağaza türü, ana renk, arka plan rengi, yazı rengi ve bölümler.
// Yapay zeka kullanmaz, mesaj hakkı harcamaz; sonuç her zaman aynıdır.
//
// Hem tarayıcıda (butonları çizmek için) hem sunucuda (seçimi uygulamak
// için) kullanılır. Sunucu, tarayıcıdan gelen seçimi BU listeye göre
// kontrol eder; listede olmayan bir değer kabul edilmez.
// ─────────────────────────────────────────────────────────────

import type { MagazaAyarlari } from "@/templates/magaza/tipler";
import { KATEGORILER, RENKLER, VARSAYILAN_AYARLAR } from "@/templates/magaza/varsayilan";

export type Secenek = {
  kod: string;
  etiket: string;
  renk?: string; // renk seçeneklerinde küçük daire olarak gösterilir
  emoji?: string;
};

export type SecenekGrubu = {
  kod: "tur" | "anaRenk" | "arkaPlan" | "yaziRengi" | "bolum";
  baslik: string;
  secenekler: Secenek[];
};

const BOLUM_ADLARI: Record<keyof MagazaAyarlari["bolumler"], string> = {
  hakkimizda: "Hakkımızda",
  yorumlar: "Yorumlar",
  sss: "SSS",
  iletisim: "İletişim",
};

export const SECENEK_GRUPLARI: SecenekGrubu[] = [
  {
    kod: "tur",
    baslik: "Mağaza türü",
    secenekler: [
      { kod: "giyim", etiket: "Giyim", emoji: "👕" },
      { kod: "ayakkabı", etiket: "Ayakkabı", emoji: "👟" },
      { kod: "kahve", etiket: "Kahve", emoji: "☕" },
      { kod: "takı", etiket: "Takı", emoji: "💍" },
    ],
  },
  {
    kod: "anaRenk",
    baslik: "Ana renk (butonlar, başlıklar)",
    secenekler: ["mavi", "yeşil", "mor", "turuncu"].map((ad) => ({
      kod: ad,
      etiket: ad.charAt(0).toLocaleUpperCase("tr") + ad.slice(1),
      renk: RENKLER[ad].ana,
    })),
  },
  {
    kod: "arkaPlan",
    baslik: "Arka plan rengi",
    secenekler: [
      { kod: "#ffffff", etiket: "Beyaz", renk: "#ffffff" },
      { kod: "#fdf8f0", etiket: "Krem", renk: "#fdf8f0" },
      { kod: "#f1f5f9", etiket: "Açık gri", renk: "#f1f5f9" },
      { kod: "#eef6ff", etiket: "Buz mavisi", renk: "#eef6ff" },
    ],
  },
  {
    kod: "yaziRengi",
    baslik: "Yazı rengi",
    secenekler: [
      { kod: "#18181b", etiket: "Siyah", renk: "#18181b" },
      { kod: "#1e3a5f", etiket: "Lacivert", renk: "#1e3a5f" },
      { kod: "#4a2f1d", etiket: "Kahve", renk: "#4a2f1d" },
      { kod: "#1f3d2b", etiket: "Koyu yeşil", renk: "#1f3d2b" },
    ],
  },
  {
    kod: "bolum",
    baslik: "Bölümler (aç / kapat)",
    secenekler: (Object.keys(BOLUM_ADLARI) as (keyof typeof BOLUM_ADLARI)[]).map((b) => ({ kod: b, etiket: BOLUM_ADLARI[b] })),
  },
];

/** Bu seçenek şu anki ayarlarda seçili mi? (butonu vurgulamak için) */
export function seciliMi(a: MagazaAyarlari | null, grup: SecenekGrubu["kod"], kod: string) {
  const g = a ?? VARSAYILAN_AYARLAR;
  switch (grup) {
    case "tur":
      return g.kategori === kod;
    case "anaRenk":
      return g.renk.ad === kod;
    case "arkaPlan":
      return (g.arkaPlan ?? "#ffffff") === kod;
    case "yaziRengi":
      return (g.yaziRengi ?? "#18181b") === kod;
    case "bolum":
      return g.bolumler[kod as keyof MagazaAyarlari["bolumler"]] === true;
  }
}

/**
 * Seçimi ayarlara uygular. Geçersiz grup/değer gelirse null döner.
 * Mevcut ayarları bozmaz, yeni bir kopya döndürür.
 */
export function secimiUygula(eski: MagazaAyarlari | null, grupKodu: string, kod: string): { ayarlar: MagazaAyarlari; mesaj: string } | null {
  const grup = SECENEK_GRUPLARI.find((g) => g.kod === grupKodu);
  const secenek = grup?.secenekler.find((s) => s.kod === kod);
  if (!grup || !secenek) return null;

  const yeni = structuredClone(eski ?? VARSAYILAN_AYARLAR);
  switch (grup.kod) {
    case "tur":
      yeni.kategori = kod;
      yeni.urunler = KATEGORILER[kod].urunler;
      return { ayarlar: yeni, mesaj: `Mağaza türünü "${secenek.etiket}" yaptım ve örnek ürünler koydum.` };
    case "anaRenk":
      yeni.renk = RENKLER[kod];
      return { ayarlar: yeni, mesaj: `Ana rengi ${secenek.etiket.toLocaleLowerCase("tr")} yaptım.` };
    case "arkaPlan":
      yeni.arkaPlan = kod;
      return { ayarlar: yeni, mesaj: `Arka planı ${secenek.etiket.toLocaleLowerCase("tr")} yaptım.` };
    case "yaziRengi":
      yeni.yaziRengi = kod;
      return { ayarlar: yeni, mesaj: `Yazı rengini ${secenek.etiket.toLocaleLowerCase("tr")} yaptım.` };
    case "bolum": {
      const b = kod as keyof MagazaAyarlari["bolumler"];
      yeni.bolumler[b] = !yeni.bolumler[b];
      return { ayarlar: yeni, mesaj: `${secenek.etiket} bölümünü ${yeni.bolumler[b] ? "ekledim" : "kaldırdım"}.` };
    }
  }
}
