// ─────────────────────────────────────────────────────────────
// demo.ts — "Demo modu" ayarları (sadece sunucuda kullanılır)
//
// Claude API anahtarı tanımlı değilse site demo modunda çalışır:
//   • Sohbete kurallarla çalışan sahte yapay zeka cevap verir (masraf yok).
//   • Yapay zeka masrafı olmadığı için e-posta doğrulaması site oluşturmak
//     ve sohbet etmek için zorunlu değildir. (Yayın talebi için hâlâ zorunlu.)
// Canlı demo (herkese açık) bu modda çalışıyor.
// ─────────────────────────────────────────────────────────────

export const demoModu = () => !process.env.ANTHROPIC_API_KEY;

/** Site oluşturma / sohbet için e-posta doğrulaması gerekiyor mu? */
export const dogrulamaZorunluMu = (k: { epostaDogrulandi: string | null }) => !k.epostaDogrulandi && !demoModu();
