// Küçük yardımcı fonksiyonlar (hem sunucuda hem tarayıcıda kullanılabilir)

const TR_HARFLER: Record<string, string> = { ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u", â: "a", î: "i", û: "u" };

/** "Lavmira Mum & Şamdan" → "lavmira-mum-samdan" (internet adresinde kullanılabilir hale getirir) */
export function slugOlustur(metin: string) {
  return metin
    .toLocaleLowerCase("tr")
    .replace(/[çğıöşüâîû]/g, (h) => TR_HARFLER[h] ?? h)
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-") // harf/rakam dışındaki her şey tire olsun
    .replace(/^-+|-+$/g, "") // baştaki/sondaki tireleri sil
    .slice(0, 40)
    .replace(/-+$/g, "");
}

// Saywright'ın kendi sayfalarıyla karışabilecek adresler
const AYRILMIS = ["admin", "api", "panel", "giris", "kayit", "yonetim", "olustur", "saywright", "destek", "yardim", "m"];

/** Adres kurallara uyuyor mu? Uymuyorsa Türkçe hata mesajı döner. */
export function slugHatasi(slug: string): string | null {
  if (slug.length < 3 || slug.length > 40) return "Adres 3 ile 40 karakter arasında olmalı.";
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) return "Adreste sadece küçük harf, rakam ve tire (-) kullanılabilir.";
  if (AYRILMIS.includes(slug)) return "Bu adres ayrılmış, başka bir adres seç.";
  return null;
}

/** "Kaan Yılmaz" → "KY" */
export const basHarfler = (ad: string) =>
  ad
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toLocaleUpperCase("tr"))
    .join("");
