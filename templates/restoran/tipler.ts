// ─────────────────────────────────────────────────────────────
// Restoran şablonunun ayar dosyasının şekli
// (Alışveriş şablonuyla aynı mantık: yapay zeka bunu doldurur,
//  RestoranSablonu.tsx de bu ayarlara bakıp siteyi çizer.)
// ─────────────────────────────────────────────────────────────

export type Yemek = {
  ad: string;
  aciklama: string;
  fiyat: number; // TL
  emoji: string;
  etiket?: string; // "Şefin Önerisi", "Vejetaryen" gibi
};

export type RestoranAyarlari = {
  ad: string;
  slogan: string;
  mutfak: string; // "Ege Mutfağı", "İtalyan" ...
  renk: {
    ana: string; // vurgu rengi (butonlar, fiyatlar)
    koyu: string; // karşılama alanı ve alt bilgi arka planı
    acik: string; // açık bölümlerin arka planı
  };
  imzaYemekler: Yemek[];
  menu: { kategori: string; yemekler: Yemek[] }[];
  hakkimizda: string;
  sefSozu: string;
  sefAdi: string;
  adres: string;
  telefon: string;
  saatler: string;
};
