// ─────────────────────────────────────────────────────────────
// planlar.ts — Üyelik planları
//
// Kimin ne kadar kullanabileceği ve hangi hizmeti aldığı SADECE burada.
// Planlar "kim yönetir?" sorusuna göre ayrılıyor:
//   Keşfet     → siteyi tasarla ve önizle (yayın yok)
//   Pro        → site yayında, SEN admin panelinden yönetirsin
//   Tam Hizmet → site yayında, BİZİM ekibimiz her şeyi yönetir
// Ödeme sistemi bağlandığında kullanıcının "plan" alanını değiştirmek yeterli.
// ─────────────────────────────────────────────────────────────

export type PlanKodu = "ucretsiz" | "pro" | "isletme";

export type Plan = {
  ad: string;
  fiyat: number; // TL
  odeme: "ucretsiz" | "tek" | "aylik"; // tek = tek seferlik ödeme, aylik = her ay
  siteHakki: number; // toplam kaç site oluşturabilir
  siteBasinaMesaj: number; // her sitede yapay zekaya kaç mesaj atabilir
  yayinHakki: number; // aynı anda kaç sitesi yayın onaylı olabilir
  satista: boolean; // false → "Çok yakında" olarak gösterilir
  adminPaneli: boolean; // ürün ekle/sil/düzenle paneline erişim
  yayin: boolean; // siteyi /m/[adres] ile herkese açabilir mi?
  kimIcin: string; // bu plan kime uygun?
  neAlirsin: string; // sonunda elinde nasıl bir site olur?
  kimYonetir: string;
  ozellikler: string[];
};

export const PLANLAR: Record<PlanKodu, Plan> = {
  ucretsiz: {
    ad: "Keşfet",
    fiyat: 0,
    odeme: "ucretsiz",
    siteHakki: 2,
    siteBasinaMesaj: 15,
    yayinHakki: 0,
    satista: true,
    adminPaneli: false,
    yayin: false,
    kimIcin: "Fikrini görmek, denemek isteyenler",
    neAlirsin: "Tasarımını baştan sona görebildiğin bir site önizlemesi",
    kimYonetir: "Henüz yayında değil",
    ozellikler: [
      "2 site oluşturma hakkı",
      "Site başına 15 düzenleme mesajı",
      "Yapay zekayla tam tasarım",
      "Canlı önizleme",
      "Alan adı yok, siten sadece önizlemede",
    ],
  },
  pro: {
    ad: "Pro",
    fiyat: 2500,
    odeme: "tek",
    siteHakki: 3,
    siteBasinaMesaj: 100,
    yayinHakki: 1,
    satista: true, // "Yayınla" sihirbazından havale ile satın alınır
    adminPaneli: true,
    yayin: true,
    kimIcin: "Bir kere ödeyip sitesini kendisi yönetmek isteyenler",
    neAlirsin: "Yayına alınmış, admin paneliyle birlikte sana teslim edilen bir site",
    kimYonetir: "Teslimden sonra sen yönetirsin",
    ozellikler: [
      "Tek seferlik ödeme, aylık ücret yok",
      "Siten ekibimizin onayıyla yayına alınır",
      "🌐 Kendi alan adın ilk yıl hediye (500 ₺'ye kadar, örn. .com / .com.tr)",
      "Alan adını biz alır, biz bağlarız: sen sadece adını seçersin",
      "Admin paneli teslim edilir: ürün ekle, sil, düzenle",
      "Fiyat, stok ve kampanyaları kendin yönetirsin",
      "Teslimden sonra site tamamen senin",
      "3 tasarım denemesi · site başına 100 mesaj",
    ],
  },
  isletme: {
    ad: "Tam Hizmet",
    fiyat: 1499,
    odeme: "aylik",
    siteHakki: 20,
    siteBasinaMesaj: 300,
    yayinHakki: 20,
    satista: false,
    adminPaneli: true,
    yayin: true,
    kimIcin: "İşine odaklanıp siteyle hiç uğraşmak istemeyenler",
    neAlirsin: "Kurulumundan bakımına kadar ekibimizin yönettiği site",
    kimYonetir: "Biz yönetiriz — sen sadece söylersin",
    ozellikler: [
      "Pro'daki her şey + aylık bakım",
      "Ürünlerini ekibimiz yükler ve günceller",
      "Ödeme altyapısı ve kargo entegrasyonu kurulumu",
      "🌐 Alan adı her yıl dahil (1.000 ₺'ye kadar), kurulum ve yenileme bizden",
      "Kurumsal e-posta (info@siteadin.com)",
      "Aylık SEO ve performans raporu",
      "Kişisel danışman, WhatsApp'tan öncelikli destek",
    ],
  },
};

/**
 * Admin paneli bu kullanıcıya açık mı?
 * Geliştirme sırasında (npm run dev) herkese açık, böylece Pro satın almadan test edebiliyoruz.
 * Yayındaki sitede (production) sadece planı izin verenlere açık.
 */
export function adminPaneliAcikMi(plan: PlanKodu) {
  return PLANLAR[plan].adminPaneli || process.env.NODE_ENV !== "production";
}

/**
 * Sahip bu siteyi kendi başına yayına alıp kaldırabilir mi?
 * Artık geliştirmede bile "kestirme" yok: önce Saywright admini yayın talebini onaylamalı
 * (yayinOnayi dolu) ve paketi yayına izin vermeli.
 */
export function yayinAcikMi(plan: PlanKodu, yayinOnayi: string | null) {
  return PLANLAR[plan].yayin && yayinOnayi !== null;
}

// ── Kendi alan adı ──
// Pakete dahil alan adı bütçesi (TL). Bu tutarı aşan uzantılarda farkı müşteri öder.
export const ALAN_ADI_BUTCESI = { pro: 500, isletme: 1000 } as const;

// Fiyat tablosunun altındaki karşılaştırma tablosu.
// Her satır: [özellik, Keşfet, Pro, Tam Hizmet]  (true = ✓, false = —)
export const KARSILASTIRMA: [string, string | boolean, string | boolean, string | boolean][] = [
  ["Ödeme şekli", "Ücretsiz", "Tek seferlik", "Aylık"],
  ["Yapay zekayla site tasarımı", true, true, true],
  ["Site sayısı", "2 önizleme", "1 yayında", "20"],
  ["Site başına düzenleme mesajı", "15", "100", "300"],
  ["İnternette yayın", false, true, true],
  ["Kendi alan adın (örn. siteadin.com)", false, "İlk yıl hediye", "Her yıl dahil"],
  ["Alan adı satın alma ve bağlama", false, "Biz yaparız", "Biz yaparız"],
  ["Alan adı yenileme (2. yıldan sonra)", false, "Yıllık ücretli", "Dahil"],
  ["Admin paneli (ürün ekle / sil)", false, true, true],
  ["Sipariş takibi", false, true, true],
  ["Ürünleri bizim ekibimiz yükler", false, false, true],
  ["Ödeme ve kargo kurulumu", false, false, true],
  ["Aylık SEO raporu", false, false, true],
  ["Siteyi kim yönetir?", "—", "Sen", "Biz"],
  ["Destek", "E-posta", "Kurulum ve teslim desteği", "Kişisel danışman"],
];
