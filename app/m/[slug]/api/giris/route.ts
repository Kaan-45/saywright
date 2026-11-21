// POST /m/[adres]/api/giris — mağaza müşterisi girişi
import { hata, magazayiBul } from "@/lib/musteriApi";
import { musteriBulEposta, musteriOturumAc } from "@/lib/musteriler";
import { sifreDogruMu } from "@/lib/oturum";

export async function POST(istek: Request, ctx: RouteContext<"/m/[slug]/api/giris">) {
  const m = await magazayiBul(ctx);
  if ("yanit" in m) return m.yanit;

  const g = (await istek.json().catch(() => ({}))) as Record<string, unknown>;
  const musteri = await musteriBulEposta(m.magaza.id, String(g.eposta ?? "").trim().toLowerCase());
  // "E-posta yok" ile "şifre yanlış" için aynı mesaj: kimin üye olduğu tahmin edilemesin
  if (!musteri || !sifreDogruMu(String(g.sifre ?? ""), musteri.sifreHash)) return hata("E-posta veya şifre hatalı.", 401);

  await musteriOturumAc(musteri.id, m.magaza.id, m.slug);
  return Response.json({ tamam: true });
}
