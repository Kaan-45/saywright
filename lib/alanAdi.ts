// ─────────────────────────────────────────────────────────────
// alanAdi.ts — Kendi alan adı (örn. "lavmiramum.com") için ortak kurallar
// (Hem tarayıcıda hem sunucuda kullanılır.)
//
// ŞİMDİLİK ELLE: Müşteri istediği adı seçer, talep Saywright admin paneline düşer,
// admin alan adını satın alıp bağlar. İleride bir alan adı satıcısının API'si ile
// "müsait mi?" sorgusu ve canlı fiyat buraya eklenecek.
// ─────────────────────────────────────────────────────────────

import { slugOlustur } from "./yardimci";

/**
 * Sunulan uzantılar. "tahmini" fiyatlar ilk yıl için yaklaşık TL değerleridir ve sadece
 * müşteriye fikir vermek içindir. Kesin fiyatı admin satın almadan önce teyit eder.
 */
export const UZANTILAR = [
  { uzanti: ".com", tahmini: 450, aciklama: "En bilinen, her yerde güven verir" },
  { uzanti: ".com.tr", tahmini: 350, aciklama: "Türkiye'deki müşteriler için" },
  { uzanti: ".net", tahmini: 550, aciklama: "" },
  { uzanti: ".org", tahmini: 500, aciklama: "" },
  { uzanti: ".store", tahmini: 900, aciklama: "Mağazalar için yeni uzantı" },
  { uzanti: ".shop", tahmini: 1200, aciklama: "Mağazalar için yeni uzantı" },
] as const;

export type Uzanti = (typeof UZANTILAR)[number]["uzanti"];

/** "Lavmira Mum" → "lavmiramum" (alan adında tire olabilir ama boşluksuz kısa ad daha akılda kalır) */
export const alanAdiKokuOner = (magazaAdi: string) => slugOlustur(magazaAdi).replace(/-/g, "").slice(0, 30);

/** Alan adının "kök" kısmı (uzantısız) kurallara uyuyor mu? */
export function alanAdiKokuHatasi(kok: string): string | null {
  if (kok.length < 2 || kok.length > 63) return "Alan adı 2 ile 63 karakter arasında olmalı.";
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(kok)) return "Alan adında sadece küçük harf, rakam ve tire (-) kullanılabilir.";
  return null;
}

/** Tam alan adı ("abc.com") geçerli ve desteklenen bir uzantıyla mı bitiyor? */
export function alanAdiHatasi(alanAdi: string): string | null {
  const u = UZANTILAR.find((x) => alanAdi.endsWith(x.uzanti));
  if (!u) return "Bu uzantıyı şu an desteklemiyoruz.";
  return alanAdiKokuHatasi(alanAdi.slice(0, -u.uzanti.length));
}

/** Admin'in bağladığı (her uzantıya açık) alan adı için daha gevşek kontrol */
export function bagliAlanAdiHatasi(alanAdi: string): string | null {
  if (!/^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/.test(alanAdi)) return "Geçerli bir alan adı yaz, örn. abc.com";
  return null;
}
