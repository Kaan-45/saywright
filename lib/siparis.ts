// ─────────────────────────────────────────────────────────────
// siparis.ts — Sipariş hesaplamaları ve sabitler
// Hem tarayıcıda (sepet özeti) hem sunucuda (gerçek tutar) AYNI kurallar kullanılsın diye tek yerde.
// Not: Sunucu tutarları her zaman kendisi hesaplar; tarayıcının gönderdiği fiyata güvenmez.
// ─────────────────────────────────────────────────────────────

export const KARGO_UCRETI_KURUS = 4990; // 49,90 TL
export const UCRETSIZ_KARGO_ESIGI_KURUS = 50000; // 500 TL ve üzeri kargo bedava
export const MAKS_ADET = 20; // bir üründen tek siparişte en fazla

export const kurus = (tl: number) => Math.round(tl * 100);
export const tlYaz = (k: number) => (k / 100).toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " TL";

export function tutarlariHesapla(kalemler: { birimKurus: number; adet: number }[]) {
  const araToplam = kalemler.reduce((t, k) => t + k.birimKurus * k.adet, 0);
  const kargo = araToplam === 0 || araToplam >= UCRETSIZ_KARGO_ESIGI_KURUS ? 0 : KARGO_UCRETI_KURUS;
  return { araToplam, kargo, toplam: araToplam + kargo };
}

export type SiparisDurumu = "yeni" | "hazirlaniyor" | "kargoda" | "teslim" | "iptal";
export type OdemeYontemi = "kapida" | "havale";

export const DURUMLAR: Record<SiparisDurumu, { ad: string; ikon: string; renk: string }> = {
  yeni: { ad: "Yeni", ikon: "🆕", renk: "bg-sky-100 text-sky-800" },
  hazirlaniyor: { ad: "Hazırlanıyor", ikon: "📦", renk: "bg-amber-100 text-amber-800" },
  kargoda: { ad: "Kargoda", ikon: "🚚", renk: "bg-violet-100 text-violet-800" },
  teslim: { ad: "Teslim edildi", ikon: "✅", renk: "bg-emerald-100 text-emerald-800" },
  iptal: { ad: "İptal edildi", ikon: "✖", renk: "bg-zinc-200 text-zinc-600" },
};

/** Bir durumdan hangi durumlara geçilebilir? (örn. teslim edilmiş sipariş tekrar "yeni" olamaz) */
export const SONRAKI_DURUMLAR: Record<SiparisDurumu, SiparisDurumu[]> = {
  yeni: ["hazirlaniyor", "iptal"],
  hazirlaniyor: ["kargoda", "iptal"],
  kargoda: ["teslim"],
  teslim: [],
  iptal: [],
};

export const ODEME_YONTEMLERI: Record<OdemeYontemi, { ad: string; aciklama: string }> = {
  kapida: { ad: "Kapıda ödeme", aciklama: "Siparişini teslim alırken nakit veya kartla öde." },
  havale: { ad: "Havale / EFT", aciklama: "Sipariş sonrası mağaza sana banka bilgilerini iletir." },
};

export type Teslimat = { adSoyad: string; telefon: string; il: string; ilce: string; adres: string; not?: string };

export type Siparis = {
  id: string;
  kod: string;
  siteId: string;
  musteriId: string | null;
  eposta: string;
  durum: SiparisDurumu;
  odemeYontemi: OdemeYontemi;
  kalemler: { ad: string; emoji: string; birimKurus: number; adet: number }[];
  teslimat: Teslimat;
  araToplamKurus: number;
  kargoKurus: number;
  toplamKurus: number;
  kargoTakip: string | null;
  olusturma: string;
  guncelleme: string;
};
