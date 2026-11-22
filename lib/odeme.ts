// ─────────────────────────────────────────────────────────────
// odeme.ts — Saywright'a yapılacak paket ödemeleri (şimdilik havale/EFT)
//
// Banka bilgileri KODDA DEĞİL, ortam değişkenlerinde durur (depo herkese açık):
//   HAVALE_ALICI  → hesap sahibinin adı
//   HAVALE_BANKA  → banka adı
//   HAVALE_IBAN   → IBAN
// Yerelde .env.local'e, canlıda Vercel → Settings → Environment Variables'a yazılır.
// IBAN tanımlı değilse ekranda örnek bilgiler ve "örnektir" uyarısı gösterilir.
// Kart ile ödeme bağlandığında bu dosya ödeme sağlayıcısına (iyzico, PayTR vb.) yönlendirecek.
// ─────────────────────────────────────────────────────────────

export type HavaleBilgileri = {
  alici: string;
  banka: string;
  iban: string;
  ornekMi: boolean; // gerçek bilgiler tanımlı değilse true → ekranda uyarı çıkar
};

/** Sadece sunucuda çağrılır (sayfa bileşeni), sonuç istemciye prop olarak geçer. */
export function havaleBilgileri(): HavaleBilgileri {
  const iban = process.env.HAVALE_IBAN?.trim();
  if (!iban) {
    return {
      alici: "ÖRNEK · Saywright",
      banka: "ÖRNEK Banka",
      iban: "TR00 0000 0000 0000 0000 0000 00",
      ornekMi: true,
    };
  }
  return {
    alici: process.env.HAVALE_ALICI?.trim() || "Saywright",
    banka: process.env.HAVALE_BANKA?.trim() || "Banka",
    iban,
    ornekMi: false,
  };
}

/** Havale açıklamasına yazılacak kısa kod. Ödemeyi hangi talebe ait olduğunu anlamak için. */
export function odemeKoduUret() {
  const harfler = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // karışan harfler (0/O, 1/I/L) yok
  let kod = "SW-";
  for (let i = 0; i < 5; i++) kod += harfler[Math.floor(Math.random() * harfler.length)];
  return kod;
}
