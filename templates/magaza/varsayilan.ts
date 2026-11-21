// ─────────────────────────────────────────────────────────────
// varsayilan.ts — Şablonun hazır gelen içeriği
//
// Müşteri hiçbir şey söylemese bile site boş kalmasın diye
// her alanın bir başlangıç değeri var. Yapay zeka bunların
// sadece müşterinin bahsettiği kısımlarını değiştirir.
// ─────────────────────────────────────────────────────────────

import type { MagazaAyarlari, RenkTemasi, Urun } from "./tipler";

export const RENKLER: Record<string, RenkTemasi> = {
  mavi: { ad: "mavi", ana: "#2563eb", acik: "#eff6ff" },
  kırmızı: { ad: "kırmızı", ana: "#dc2626", acik: "#fef2f2" },
  yeşil: { ad: "yeşil", ana: "#16a34a", acik: "#f0fdf4" },
  mor: { ad: "mor", ana: "#7c3aed", acik: "#f5f3ff" },
  turuncu: { ad: "turuncu", ana: "#ea580c", acik: "#fff7ed" },
  pembe: { ad: "pembe", ana: "#db2777", acik: "#fdf2f8" },
  siyah: { ad: "siyah", ana: "#18181b", acik: "#f4f4f5" },
  kahverengi: { ad: "kahverengi", ana: "#92400e", acik: "#fffbeb" },
};

// Her kategori için örnek ürünler. Müşteri ürün listesi vermezse bunlar kullanılır.
export const KATEGORILER: Record<string, { anahtarlar: string[]; urunler: Urun[] }> = {
  giyim: {
    anahtarlar: ["giyim", "kıyafet", "elbise", "tişört", "moda", "butik"],
    urunler: [
      { ad: "Basic Tişört", fiyat: 249, aciklama: "%100 pamuk, rahat kesim", emoji: "👕" },
      { ad: "Kot Pantolon", fiyat: 699, aciklama: "Slim fit, koyu yıkama", emoji: "👖" },
      { ad: "Yazlık Elbise", fiyat: 549, aciklama: "Hafif ve nefes alan kumaş", emoji: "👗" },
      { ad: "Kapüşonlu Sweat", fiyat: 799, aciklama: "İçi şardonlu, kışlık", emoji: "🧥" },
    ],
  },
  ayakkabı: {
    anahtarlar: ["ayakkabı", "spor ayakkabı", "bot", "sneaker", "terlik"],
    urunler: [
      { ad: "Koşu Ayakkabısı", fiyat: 1499, aciklama: "Hafif taban, yüksek konfor", emoji: "👟" },
      { ad: "Deri Bot", fiyat: 1999, aciklama: "Su geçirmez hakiki deri", emoji: "🥾" },
      { ad: "Topuklu Ayakkabı", fiyat: 1199, aciklama: "Şık davetler için", emoji: "👠" },
      { ad: "Yazlık Sandalet", fiyat: 599, aciklama: "Ortopedik taban", emoji: "🩴" },
    ],
  },
  elektronik: {
    anahtarlar: ["elektronik", "telefon", "bilgisayar", "teknoloji", "kulaklık"],
    urunler: [
      { ad: "Kablosuz Kulaklık", fiyat: 1299, aciklama: "30 saat pil ömrü", emoji: "🎧" },
      { ad: "Akıllı Saat", fiyat: 2499, aciklama: "Nabız ve uyku takibi", emoji: "⌚" },
      { ad: "Powerbank 20000mAh", fiyat: 799, aciklama: "Hızlı şarj destekli", emoji: "🔋" },
      { ad: "Bluetooth Hoparlör", fiyat: 999, aciklama: "Suya dayanıklı", emoji: "🔊" },
    ],
  },
  kitap: {
    anahtarlar: ["kitap", "kırtasiye", "roman", "dergi"],
    urunler: [
      { ad: "Klasik Roman Seti", fiyat: 449, aciklama: "5 kitaplık özel kutu", emoji: "📚" },
      { ad: "Defter Seti", fiyat: 149, aciklama: "3 adet, çizgili", emoji: "📓" },
      { ad: "Dolma Kalem", fiyat: 299, aciklama: "Pirinç gövde", emoji: "🖋️" },
      { ad: "Çocuk Masal Kitabı", fiyat: 99, aciklama: "Resimli, 4-8 yaş", emoji: "📖" },
    ],
  },
  kahve: {
    anahtarlar: ["kahve", "çay", "içecek", "kafe"],
    urunler: [
      { ad: "Filtre Kahve 250g", fiyat: 289, aciklama: "Etiyopya, orta kavrum", emoji: "☕" },
      { ad: "Türk Kahvesi 200g", fiyat: 159, aciklama: "Taze çekilmiş", emoji: "🫖" },
      { ad: "French Press", fiyat: 549, aciklama: "600 ml, cam gövde", emoji: "🫙" },
      { ad: "Seramik Kupa", fiyat: 199, aciklama: "El yapımı", emoji: "🍵" },
    ],
  },
  takı: {
    anahtarlar: ["takı", "kolye", "yüzük", "bileklik", "küpe", "aksesuar"],
    urunler: [
      { ad: "Gümüş Kolye", fiyat: 899, aciklama: "925 ayar gümüş", emoji: "📿" },
      { ad: "Taşlı Yüzük", fiyat: 1199, aciklama: "Zirkon taşlı", emoji: "💍" },
      { ad: "Örgü Bileklik", fiyat: 249, aciklama: "El yapımı", emoji: "🧶" },
      { ad: "İnci Küpe", fiyat: 649, aciklama: "Tatlı su incisi", emoji: "🦪" },
    ],
  },
  kozmetik: {
    anahtarlar: ["kozmetik", "makyaj", "cilt bakım", "parfüm", "güzellik"],
    urunler: [
      { ad: "Nemlendirici Krem", fiyat: 349, aciklama: "Tüm cilt tipleri için", emoji: "🧴" },
      { ad: "Ruj", fiyat: 199, aciklama: "Kalıcı mat formül", emoji: "💄" },
      { ad: "Parfüm 50ml", fiyat: 1299, aciklama: "Çiçeksi, odunsu notalar", emoji: "🌸" },
      { ad: "Yüz Maskesi Seti", fiyat: 249, aciklama: "5'li paket", emoji: "🧖" },
    ],
  },
};

export const VARSAYILAN_AYARLAR: MagazaAyarlari = {
  magazaAdi: "Mağazam",
  slogan: "Aradığın her şey, tek tıkla kapında.",
  kategori: "giyim",
  renk: RENKLER.mavi,
  urunler: KATEGORILER.giyim.urunler,
  bolumler: { hakkimizda: true, yorumlar: true, sss: false, iletisim: true },
  hakkimizdaMetni:
    "Müşteri memnuniyetini her şeyin önünde tutan, kaliteli ürünleri uygun fiyatlarla sunan bir mağazayız.",
};
