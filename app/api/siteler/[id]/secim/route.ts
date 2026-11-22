// ─────────────────────────────────────────────────────────────
// POST /api/siteler/[id]/secim — "Hızlı seçenekler"den biri tıklandı
// { grup, kod } alır, seçimi ayarlara uygular ve kaydeder.
// Yapay zeka kullanmaz, mesaj hakkı harcamaz.
// ─────────────────────────────────────────────────────────────

import { secimiUygula } from "@/lib/demoSecenekleri";
import { dogrulamaZorunluMu } from "@/lib/demo";
import { magazaOnbellegiTemizle } from "@/lib/magazalar";
import { DOGRULAMA_GEREKLI, mevcutKullanici } from "@/lib/oturum";
import { siteAyarKaydet, siteBul } from "@/lib/veritabani";

export async function POST(istek: Request, ctx: RouteContext<"/api/siteler/[id]/secim">) {
  const { id } = await ctx.params;
  const kullanici = await mevcutKullanici();
  if (!kullanici) return Response.json({ hata: "Oturumun kapanmış, tekrar giriş yap." }, { status: 401 });
  if (dogrulamaZorunluMu(kullanici)) return Response.json({ hata: DOGRULAMA_GEREKLI }, { status: 403 });

  const site = await siteBul(id);
  if (!site || site.kullaniciId !== kullanici.id) return Response.json({ hata: "Site bulunamadı." }, { status: 404 });

  const govde = (await istek.json().catch(() => ({}))) as { grup?: unknown; kod?: unknown };
  const sonuc = secimiUygula(site.ayarlar, String(govde.grup ?? ""), String(govde.kod ?? ""));
  if (!sonuc) return Response.json({ hata: "Geçersiz seçim." }, { status: 400 });

  const kayit = await siteAyarKaydet(site.id, sonuc.ayarlar, site.surum);
  if (kayit === "cakisma") return Response.json({ hata: "Aynı anda başka bir değişiklik oldu, tekrar dene." }, { status: 409 });
  magazaOnbellegiTemizle(site.slug); // yayındaysa ziyaretçiler güncel hali görsün
  return Response.json({ ayarlar: kayit.ayarlar, mesaj: sonuc.mesaj });
}
