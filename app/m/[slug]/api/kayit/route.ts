// POST /m/[adres]/api/kayit — mağazaya müşteri olarak üye ol
import { epostaGecerli, hata, magazayiBul, telefonTemizle } from "@/lib/musteriApi";
import { musteriBulEposta, musteriOlustur, musteriOturumAc } from "@/lib/musteriler";
import { sifreHashle } from "@/lib/oturum";

export async function POST(istek: Request, ctx: RouteContext<"/m/[slug]/api/kayit">) {
  const m = await magazayiBul(ctx);
  if ("yanit" in m) return m.yanit;

  const g = (await istek.json().catch(() => ({}))) as Record<string, unknown>;
  const ad = String(g.ad ?? "").trim();
  const eposta = String(g.eposta ?? "").trim().toLowerCase();
  const sifre = String(g.sifre ?? "");
  const telefon = telefonTemizle(g.telefon);

  if (ad.length < 2 || ad.length > 60) return hata("Adını yazar mısın? (2-60 karakter)", 400);
  if (!epostaGecerli(eposta)) return hata("Geçerli bir e-posta adresi gir.", 400);
  if (sifre.length < 8) return hata("Şifre en az 8 karakter olmalı.", 400);
  if (telefon === false) return hata("Telefon numarası geçersiz görünüyor.", 400);
  // KVKK: açık onay olmadan kişisel veri saklamıyoruz
  if (g.kvkk !== true) return hata("Devam etmek için aydınlatma metnini onaylamalısın.", 400);
  if (await musteriBulEposta(m.magaza.id, eposta)) return hata("Bu e-posta ile zaten üyesin. Giriş yapmayı dene.", 409);

  const musteri = await musteriOlustur({ siteId: m.magaza.id, ad, eposta, sifreHash: sifreHashle(sifre), telefon });
  if (!musteri) return hata("Bu e-posta ile zaten üyesin. Giriş yapmayı dene.", 409);

  await musteriOturumAc(musteri.id, m.magaza.id, m.slug);
  return Response.json({ tamam: true });
}
