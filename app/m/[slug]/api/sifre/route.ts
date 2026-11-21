// POST /m/[adres]/api/sifre — mağaza müşterisi şifre değiştirir; diğer cihazlardaki oturumlar kapanır
import { hata, musteriyiBul } from "@/lib/musteriApi";
import { musteriDigerOturumlariSil, musteriGuncelle, musteriToken } from "@/lib/musteriler";
import { sifreDogruMu, sifreHashle } from "@/lib/oturum";

export async function POST(istek: Request, ctx: RouteContext<"/m/[slug]/api/sifre">) {
  const m = await musteriyiBul(ctx);
  if ("yanit" in m) return m.yanit;

  const g = (await istek.json().catch(() => ({}))) as Record<string, unknown>;
  const mevcut = String(g.mevcut ?? "");
  const yeni = String(g.yeni ?? "");
  if (!sifreDogruMu(mevcut, m.musteri.sifreHash)) return hata("Mevcut şifren hatalı.", 401);
  if (yeni.length < 8) return hata("Yeni şifre en az 8 karakter olmalı.", 400);
  if (yeni === mevcut) return hata("Yeni şifre eskisiyle aynı olamaz.", 400);

  await musteriGuncelle(m.musteri.id, { sifreHash: sifreHashle(yeni) });
  const token = await musteriToken();
  if (token) await musteriDigerOturumlariSil(m.musteri.id, token);
  return Response.json({ tamam: true });
}
