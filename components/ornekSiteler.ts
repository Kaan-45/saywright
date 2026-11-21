// ─────────────────────────────────────────────────────────────
// ornekSiteler.ts — Tanıtım sayfasındaki 3 örnek sitenin içeriği
// Her biri bir şablon + o şablonun ayarlarından oluşur.
// ─────────────────────────────────────────────────────────────

import type { MagazaAyarlari } from "@/templates/magaza/tipler";
import type { RestoranAyarlari } from "@/templates/restoran/tipler";

export type OrnekSite =
  | { tur: "magaza"; etiket: string; istek: string; adres: string; ayarlar: MagazaAyarlari }
  | { tur: "restoran"; etiket: string; istek: string; adres: string; ayarlar: RestoranAyarlari };

export const ORNEK_SITELER: OrnekSite[] = [
  {
    tur: "magaza",
    etiket: "🛍️ Alışveriş sitesi",
    istek: "Her şeyin satıldığı, kampanyalı, modern bir alışveriş sitesi istiyorum. Mor tonlarda olsun.",
    adres: "carsivio.com",
    ayarlar: {
      magazaAdi: "Çarşıvio",
      slogan: "Kasım fırsatları başladı, sepetini doldur!",
      kategori: "pazaryeri",
      kampanya: "Seçili ürünlerde %40'a varan indirim",
      kategoriler: ["Kadın", "Erkek", "Elektronik", "Ev & Yaşam", "Kozmetik", "Spor", "Süpermarket", "Kitap & Hobi"],
      renk: { ad: "mor", ana: "#7c3aed", acik: "#f5f3ff" },
      urunler: [
        { ad: "Kablosuz Kulaklık Pro", fiyat: 1299, eskiFiyat: 1899, aciklama: "Aktif gürültü engelleme, 40 saat pil", emoji: "🎧", rozet: "Çok Satan" },
        { ad: "Akıllı Saat Fit 5", fiyat: 2499, eskiFiyat: 3199, aciklama: "Nabız, uyku ve adım takibi", emoji: "⌚" },
        { ad: "Oversize Sweatshirt", fiyat: 449, eskiFiyat: 649, aciklama: "%100 pamuk, unisex kesim", emoji: "👕", rozet: "Yeni" },
        { ad: "Seramik Kupa Seti", fiyat: 329, aciklama: "4'lü, el yapımı sırlı", emoji: "☕" },
        { ad: "Nemlendirici Yüz Kremi", fiyat: 279, eskiFiyat: 399, aciklama: "Hyalüronik asit, 50 ml", emoji: "🧴" },
        { ad: "Yoga Matı", fiyat: 389, aciklama: "6 mm, kaymaz yüzey", emoji: "🧘" },
        { ad: "Filtre Kahve 1 kg", fiyat: 549, eskiFiyat: 689, aciklama: "Kolombiya, orta kavrum", emoji: "🫘", rozet: "Fırsat" },
        { ad: "Masa Lambası LED", fiyat: 599, aciklama: "3 renk modu, USB şarjlı", emoji: "💡" },
      ],
      bolumler: { hakkimizda: true, yorumlar: true, sss: true, iletisim: true },
      hakkimizdaMetni:
        "Çarşıvio, binlerce ürünü güvenilir satıcılarla buluşturan yeni nesil bir alışveriş platformu. Aynı gün kargo, kolay iade ve 7/24 destekle alışverişi keyfe dönüştürüyoruz.",
    },
  },
  {
    tur: "restoran",
    etiket: "🍽️ Restoran sitesi",
    istek: "Bodrum'da Ege mutfağı yapan bir balık restoranım var. Şık, koyu tonlarda, rezervasyon alabileceğim bir site.",
    adres: "tuzluruzgar.com",
    ayarlar: {
      ad: "Tuzlu Rüzgâr",
      slogan: "Denizden sofraya, Ege'nin en taze hali.",
      mutfak: "Ege Mutfağı · Bodrum",
      renk: { ana: "#d4a24c", koyu: "#14181f", acik: "#faf6ee" },
      imzaYemekler: [
        { ad: "Izgara Levrek", aciklama: "Kekik yağı, közlenmiş sebze ve limon ile", fiyat: 640, emoji: "🐟", etiket: "Şefin Önerisi" },
        { ad: "Ahtapot Carpaccio", aciklama: "İnce dilim ahtapot, kapari ve zeytinyağı", fiyat: 520, emoji: "🐙" },
        { ad: "Karides Güveç", aciklama: "Tereyağı, sarımsak ve kaşar ile fırında", fiyat: 480, emoji: "🦐", etiket: "Favori" },
      ],
      menu: [
        {
          kategori: "Mezeler",
          yemekler: [
            { ad: "Deniz Börülcesi", aciklama: "Sarımsaklı zeytinyağı ile", fiyat: 180, emoji: "🌿" },
            { ad: "Atom", aciklama: "Süzme yoğurt, kuru biber, tereyağı", fiyat: 160, emoji: "🌶️" },
            { ad: "Lakerda", aciklama: "Ev yapımı, kırmızı soğan ile", fiyat: 260, emoji: "🐟" },
          ],
        },
        {
          kategori: "Ana Yemekler",
          yemekler: [
            { ad: "Kalamar Tava", aciklama: "Tarator sos ile", fiyat: 420, emoji: "🦑" },
            { ad: "Günün Balığı", aciklama: "Izgara veya buğulama, mevsim salatası", fiyat: 690, emoji: "🐠" },
            { ad: "Deniz Mahsullü Risotto", aciklama: "Midye, karides ve kalamar", fiyat: 560, emoji: "🍚" },
          ],
        },
        {
          kategori: "Tatlılar",
          yemekler: [
            { ad: "Fırın Sütlaç", aciklama: "Tarçın ve fındık ile", fiyat: 170, emoji: "🍮" },
            { ad: "Kabak Tatlısı", aciklama: "Tahin ve ceviz ile", fiyat: 190, emoji: "🎃" },
          ],
        },
        {
          kategori: "İçecekler",
          yemekler: [
            { ad: "Ev Yapımı Limonata", aciklama: "Taze nane ile", fiyat: 110, emoji: "🍋" },
            { ad: "Türk Kahvesi", aciklama: "Lokum eşliğinde", fiyat: 90, emoji: "☕" },
          ],
        },
      ],
      hakkimizda: "1998'den beri her sabah tekneden gelen balıkla, annemizin tarifleri ve Ege'nin otlarıyla sofra kuruyoruz.",
      sefSozu: "Balık taze ise ona fazla dokunmazsınız. Biz sadece denizin tadını sofraya taşıyoruz.",
      sefAdi: "Mert Ayaz",
      adres: "Kumbahçe Mah., Bodrum / Muğla",
      telefon: "0252 000 00 00",
      saatler: "Her gün 12:00 – 00:00",
    },
  },
  {
    tur: "magaza",
    etiket: "👟 Ayakkabı mağazası",
    istek: "Spor ve günlük ayakkabı satıyorum. Dinamik, mavi tonlarda, indirimleri öne çıkaran bir site olsun.",
    adres: "tabanova.com",
    ayarlar: {
      magazaAdi: "Tabanova",
      slogan: "Her adımda konfor, her koşuda rekor.",
      kategori: "ayakkabı",
      kampanya: "Sezon sonu: ikinci çifte %50 indirim",
      kategoriler: ["Koşu", "Basketbol", "Günlük", "Outdoor", "Kadın", "Erkek", "Çocuk", "Outlet"],
      renk: { ad: "mavi", ana: "#2563eb", acik: "#eff6ff" },
      urunler: [
        { ad: "AirRun Koşu Ayakkabısı", fiyat: 2199, eskiFiyat: 2899, aciklama: "Hafif köpük taban, nefes alan üst yüzey", emoji: "👟", rozet: "Çok Satan" },
        { ad: "Trail Pro Outdoor Bot", fiyat: 3299, aciklama: "Su geçirmez, kaymaz Vibram taban", emoji: "🥾", rozet: "Yeni" },
        { ad: "Street Classic Sneaker", fiyat: 1599, eskiFiyat: 1999, aciklama: "Deri, günlük kullanım", emoji: "👞" },
        { ad: "Court Basketbol Ayakkabısı", fiyat: 2799, aciklama: "Bilek destekli, yüksek tutuş", emoji: "🏀" },
        { ad: "Zarif Topuklu Ayakkabı", fiyat: 1399, eskiFiyat: 1799, aciklama: "7 cm topuk, yumuşak iç taban", emoji: "👠" },
        { ad: "Yazlık Sandalet", fiyat: 699, eskiFiyat: 999, aciklama: "Ortopedik taban, ayarlanabilir", emoji: "🩴", rozet: "Fırsat" },
        { ad: "Kışlık Deri Bot", fiyat: 2599, aciklama: "İçi kürklü, hakiki deri", emoji: "🥿" },
        { ad: "Performans Çorap 3'lü", fiyat: 199, aciklama: "Ter emici, dikişsiz", emoji: "🧦" },
      ],
      bolumler: { hakkimizda: true, yorumlar: true, sss: true, iletisim: true },
      hakkimizdaMetni:
        "2012'den beri koşucular, sporcular ve şehir insanı için en doğru ayakkabıyı seçiyoruz. Tüm ürünlerimiz orijinal ve 2 yıl garantili.",
    },
  },
];
