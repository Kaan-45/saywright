// ─────────────────────────────────────────────────────────────
// odeme.ts — Saywright'a yapılacak paket ödemeleri (şimdilik havale/EFT)
//
// ⚠️ AŞAĞIDAKİ HESAP BİLGİLERİ ÖRNEKTİR. Gerçek satışa başlamadan önce kendi
// (şirket ya da şahıs) banka bilgilerini buraya yaz. Kart ile ödeme bağlandığında
// bu dosya ödeme sağlayıcısına (iyzico, PayTR vb.) yönlendirecek.
// ─────────────────────────────────────────────────────────────

export const HAVALE_BILGILERI = {
  alici: "ÖRNEK · Saywright (kendi adını yaz)",
  banka: "ÖRNEK Banka",
  iban: "TR00 0000 0000 0000 0000 0000 00",
  ornekMi: true, // gerçek bilgileri yazınca false yap → ekrandaki "örnek" uyarısı kalkar
};

/** Havale açıklamasına yazılacak kısa kod. Ödemeyi hangi talebe ait olduğunu anlamak için. */
export function odemeKoduUret() {
  const harfler = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // karışan harfler (0/O, 1/I/L) yok
  let kod = "SW-";
  for (let i = 0; i < 5; i++) kod += harfler[Math.floor(Math.random() * harfler.length)];
  return kod;
}
