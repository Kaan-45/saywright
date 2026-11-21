// ─────────────────────────────────────────────────────────────
// sahteYapayZeka.ts — Şimdilik "taklit" yapay zeka
//
// Müşterinin yazdığı metni okuyup ayar nesnesini günceller.
// Gerçek yapay zeka değil; anahtar kelimelere bakan basit kurallar.
//
// Neden böyle? API anahtarımız yokken bütün sistemi kurup test
// edebilelim diye. İleride sadece bu dosyanın içini Claude API
// çağrısıyla değiştireceğiz; sitenin geri kalanı aynen kalacak.
// Çünkü dışarıdan bakınca aynı işi yapıyor:
//   (eski ayarlar + müşterinin mesajı) → (yeni ayarlar + cevap)
// ─────────────────────────────────────────────────────────────

import type { MagazaAyarlari } from "@/templates/magaza/tipler";
import { KATEGORILER, RENKLER } from "@/templates/magaza/varsayilan";

export type YapayZekaCevabi = {
  ayarlar: MagazaAyarlari;
  mesaj: string; // müşteriye gösterilecek açıklama
};

// Bölüm adları ve metinde hangi kelimelerle geçebilecekleri
const BOLUM_KELIMELERI: Record<keyof MagazaAyarlari["bolumler"], string[]> = {
  hakkimizda: ["hakkımızda", "hakkimizda"],
  yorumlar: ["yorum", "müşteri görüş", "referans"],
  sss: ["sss", "sıkça sorulan", "sık sorulan"],
  iletisim: ["iletişim", "iletisim", "adres", "telefon numara"],
};

const BOLUM_ADLARI: Record<keyof MagazaAyarlari["bolumler"], string> = {
  hakkimizda: "Hakkımızda",
  yorumlar: "Müşteri yorumları",
  sss: "Sıkça sorulan sorular",
  iletisim: "İletişim",
};

const KALDIR_KELIMELERI = ["kaldır", "sil", "çıkar", "istemiyorum", "olmasın", "gizle"];

export function sahteYapayZeka(eski: MagazaAyarlari, metin: string): YapayZekaCevabi {
  // structuredClone: eski ayarların tam bir kopyasını alır,
  // böylece eskisini bozmadan yenisini değiştirebiliriz.
  const yeni = structuredClone(eski);
  const kucuk = metin.toLocaleLowerCase("tr");
  const degisiklikler: string[] = [];

  // 1) Mağaza adı: "adı X olsun", "ismi X olsun" veya tırnak içinde "X" adında
  const adEslesme =
    metin.match(/(?:ad[ıi]|ism[ıi])\s+["“']?([^"”'.,\n]+?)["”']?\s+olsun/i) ||
    metin.match(/["“']([^"”']+)["”']\s*(?:adında|adlı|isimli)/i);
  if (adEslesme) {
    yeni.magazaAdi = adEslesme[1].trim();
    degisiklikler.push(`Mağaza adını "${yeni.magazaAdi}" yaptım`);
  }

  // 2) Slogan: slogan "..." şeklinde
  const sloganEslesme = metin.match(/slogan\S*\s*:?\s*["“]([^"”]+)["”]/i);
  if (sloganEslesme) {
    yeni.slogan = sloganEslesme[1].trim();
    degisiklikler.push("Sloganı güncelledim");
  }

  // 3) Renk: metinde geçen ilk renk adı
  for (const renkAdi of Object.keys(RENKLER)) {
    if (kucuk.includes(renkAdi)) {
      yeni.renk = RENKLER[renkAdi];
      degisiklikler.push(`Ana rengi ${renkAdi} yaptım`);
      break;
    }
  }

  // 4) Ürün listesi: "ürünler: a, b, c"
  const urunEslesme = metin.match(/ürünler\S*\s*:\s*([^.\n]+)/i);
  if (urunEslesme) {
    const adlar = urunEslesme[1]
      .split(/,|\sve\s/)
      .map((s) => s.trim())
      .filter(Boolean);
    yeni.urunler = adlar.map((ad, i) => ({
      ad: ad.charAt(0).toLocaleUpperCase("tr") + ad.slice(1),
      fiyat: 199 + i * 150,
      aciklama: "Açıklama yakında eklenecek",
      emoji: "🛍️",
    }));
    degisiklikler.push(`${adlar.length} ürün ekledim`);
  } else {
    // Liste yoksa kategoriye bak, o kategorinin örnek ürünlerini koy
    for (const [kategori, bilgi] of Object.entries(KATEGORILER)) {
      if (bilgi.anahtarlar.some((k) => kucuk.includes(k))) {
        if (yeni.kategori !== kategori) {
          yeni.kategori = kategori;
          yeni.urunler = bilgi.urunler;
          degisiklikler.push(`Kategoriyi "${kategori}" seçtim ve örnek ürünler koydum`);
        }
        break;
      }
    }
  }

  // 5) Bölümler: kelime geçiyorsa aç; yanında "kaldır/sil" varsa kapat
  const kaldirMi = KALDIR_KELIMELERI.some((k) => kucuk.includes(k));
  for (const [bolum, kelimeler] of Object.entries(BOLUM_KELIMELERI)) {
    const anahtar = bolum as keyof MagazaAyarlari["bolumler"];
    if (kelimeler.some((k) => kucuk.includes(k))) {
      const yeniDurum = !kaldirMi;
      if (yeni.bolumler[anahtar] !== yeniDurum) {
        yeni.bolumler[anahtar] = yeniDurum;
        degisiklikler.push(`${BOLUM_ADLARI[anahtar]} bölümünü ${yeniDurum ? "ekledim" : "kaldırdım"}`);
      }
    }
  }

  const mesaj =
    degisiklikler.length > 0
      ? degisiklikler.join(". ") + "."
      : 'Ne değiştirmemi istediğini tam anlayamadım. Örnek: "rengi yeşil yap", "adı Moda Evi olsun", "SSS bölümü ekle".';

  return { ayarlar: yeni, mesaj };
}
