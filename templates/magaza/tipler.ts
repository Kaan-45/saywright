// ─────────────────────────────────────────────────────────────
// tipler.ts — Alışveriş şablonunun "ayar dosyası"nın şekli
//
// Bu sistemin kalbi burası. Yapay zeka KOD yazmaz;
// sadece bu şekle uyan bir ayar nesnesi doldurur.
// Şablon (MagazaSablonu.tsx) da bu ayarlara bakıp siteyi çizer.
//
// TypeScript'teki "type", bir nesnenin hangi alanlara sahip
// olması gerektiğini anlatır. Yanlış bir alan yazarsak
// VS Code bizi hemen kırmızı çizgiyle uyarır.
// ─────────────────────────────────────────────────────────────

export type Urun = {
  ad: string;
  fiyat: number; // TL
  aciklama: string;
  emoji: string; // gerçek fotoğraf yerine şimdilik emoji kullanıyoruz
  eskiFiyat?: number; // varsa üstü çizili gösterilir ve indirim rozeti çıkar
  rozet?: string; // "Çok Satan", "Yeni" gibi
  stok?: number; // yoksa stok takibi yapılmaz; 0 ise "Tükendi" gösterilir
};

export type RenkTemasi = {
  ad: string; // "mavi", "kırmızı"...
  ana: string; // butonlar, başlıklar (hex renk kodu, örn. #2563eb)
  acik: string; // arka plan vurguları
};

export type MagazaAyarlari = {
  magazaAdi: string;
  slogan: string;
  kategori: string;
  renk: RenkTemasi;
  urunler: Urun[];
  bolumler: {
    hakkimizda: boolean;
    yorumlar: boolean;
    sss: boolean; // sıkça sorulan sorular
    iletisim: boolean;
  };
  hakkimizdaMetni: string;
  // "?" = isteğe bağlı. Yoksa şablon makul bir varsayılan kullanır.
  kategoriler?: string[]; // üst menüdeki kategori listesi
  kampanya?: string; // vitrindeki kampanya yazısı
};
