// ─────────────────────────────────────────────────────────────
// eposta.ts — E-posta gönderme (Resend servisi üzerinden)
//
// Kurulum (gerçek e-posta göndermek için):
//   1) resend.com'da ücretsiz hesap aç → "API Keys" → yeni anahtar oluştur
//   2) .env.local dosyasına ekle:
//        RESEND_API_KEY=re_...
//        EPOSTA_GONDEREN=Saywright <bildirim@saywright.org>
//   3) Alan adını (saywright.org) Resend'de "Domains" kısmından doğrula.
//      Doğrulamadan önce sadece Resend hesabını açtığın kendi adresine gönderebilirsin.
//
// Anahtar YOKSA (geliştirme): e-posta gönderilmez, link terminale yazılır ve
// panelde gösterilir; böylece bilgisayarında her şeyi test edebilirsin.
// ─────────────────────────────────────────────────────────────

export type EpostaSonucu = { gonderildi: true } | { gonderildi: false; gelistirme: boolean; hata?: string };

export const epostaServisiVarMi = () => !!process.env.RESEND_API_KEY;

export async function epostaGonder(e: { kime: string; konu: string; html: string; metin: string }): Promise<EpostaSonucu> {
  const anahtar = process.env.RESEND_API_KEY;
  if (!anahtar) {
    console.log(`\n📧 [E-POSTA · gönderilmedi, RESEND_API_KEY yok]\n   Kime: ${e.kime}\n   Konu: ${e.konu}\n   ${e.metin}\n`);
    return { gonderildi: false, gelistirme: true };
  }

  try {
    const yanit = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${anahtar}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.EPOSTA_GONDEREN ?? "Saywright <onboarding@resend.dev>",
        to: [e.kime],
        subject: e.konu,
        html: e.html,
        text: e.metin,
      }),
    });
    if (!yanit.ok) {
      console.error("E-posta gönderilemedi:", yanit.status, await yanit.text().catch(() => ""));
      return { gonderildi: false, gelistirme: false, hata: "E-posta şu an gönderilemedi, biraz sonra tekrar dene." };
    }
    return { gonderildi: true };
  } catch {
    return { gonderildi: false, gelistirme: false, hata: "E-posta servisine ulaşılamadı." };
  }
}

/** Basit, her e-posta programında düzgün görünen şablon (tablolu, satır içi stiller) */
export function epostaSablonu(o: { baslik: string; metin: string; butonMetni: string; link: string; altNot: string }) {
  const kacir = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
  return `<!doctype html><html lang="tr"><body style="margin:0;background:#dbe8e2;font-family:Arial,Helvetica,sans-serif;color:#131b2b">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#f0f6f3;border-radius:20px;padding:32px">
<tr><td style="font-size:20px;font-weight:bold;padding-bottom:20px">💬 Saywright</td></tr>
<tr><td style="font-size:22px;font-weight:bold;padding-bottom:12px">${kacir(o.baslik)}</td></tr>
<tr><td style="font-size:15px;line-height:1.6;color:#2f4a63;padding-bottom:24px">${kacir(o.metin)}</td></tr>
<tr><td style="padding-bottom:24px"><a href="${kacir(o.link)}" style="display:inline-block;background:#131b2b;color:#ffffff;text-decoration:none;font-weight:bold;padding:14px 26px;border-radius:12px">${kacir(o.butonMetni)}</a></td></tr>
<tr><td style="font-size:12px;line-height:1.6;color:#5b7a8c">Buton çalışmazsa bu bağlantıyı tarayıcına yapıştır:<br><a href="${kacir(o.link)}" style="color:#5b91a3;word-break:break-all">${kacir(o.link)}</a></td></tr>
<tr><td style="font-size:12px;color:#5b7a8c;padding-top:20px;border-top:1px solid #c3d6ce">${kacir(o.altNot)}</td></tr>
</table></td></tr></table></body></html>`;
}
