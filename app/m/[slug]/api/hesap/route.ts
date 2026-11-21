// ─────────────────────────────────────────────────────────────
// /m/[adres]/api/hesap — mağaza müşterisinin kendi hesabı
//   PATCH  → ad ve telefon güncelle
//   DELETE → hesabı sil (şifre + "SİL" onayı) — KVKK silme hakkı
// ─────────────────────────────────────────────────────────────

import { hata, musteriyiBul, telefonTemizle } from "@/lib/musteriApi";
import { musteriGuncelle, musteriOturumKapat, musteriSil } from "@/lib/musteriler";
import { sifreDogruMu } from "@/lib/oturum";

export async function PATCH(istek: Request, ctx: RouteContext<"/m/[slug]/api/hesap">) {
  const m = await musteriyiBul(ctx);
  if ("yanit" in m) return m.yanit;

  const g = (await istek.json().catch(() => ({}))) as Record<string, unknown>;
  const ad = String(g.ad ?? "").trim();
  const telefon = telefonTemizle(g.telefon);
  if (ad.length < 2 || ad.length > 60) return hata("Ad 2 ile 60 karakter arasında olmalı.", 400);
  if (telefon === false) return hata("Telefon numarası geçersiz görünüyor.", 400);

  const guncel = await musteriGuncelle(m.musteri.id, { ad, telefon });
  return Response.json({ ad: guncel?.ad, telefon: guncel?.telefon });
}

export async function DELETE(istek: Request, ctx: RouteContext<"/m/[slug]/api/hesap">) {
  const m = await musteriyiBul(ctx);
  if ("yanit" in m) return m.yanit;

  const g = (await istek.json().catch(() => ({}))) as Record<string, unknown>;
  if (g.onay !== "SİL") return hata("Onaylamak için kutuya büyük harflerle SİL yaz.", 400);
  if (!sifreDogruMu(String(g.sifre ?? ""), m.musteri.sifreHash)) return hata("Şifre hatalı.", 401);

  await musteriOturumKapat(m.slug);
  await musteriSil(m.musteri.id); // oturumları da (cascade) silinir
  return Response.json({ tamam: true });
}
