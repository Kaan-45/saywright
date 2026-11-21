// ─────────────────────────────────────────────────────────────
// /api/siteler/[id]/yayin — Mağazayı yayına alma / kaldırma ve adres (slug)
//   GET  → önerilen adres (mağaza adından üretilir, boştaysa)
//   POST → { yayinda: boolean, slug: string } kaydeder
// ─────────────────────────────────────────────────────────────

import { magazaOnbellegiTemizle } from "@/lib/magazalar";
import { mevcutKullanici } from "@/lib/oturum";
import { yayinAcikMi } from "@/lib/planlar";
import { adresOner, siteBul, siteYayinGuncelle, slugKullaniliyorMu } from "@/lib/veritabani";
import { slugHatasi } from "@/lib/yardimci";

async function sahibiMi(id: string) {
  const kullanici = await mevcutKullanici();
  if (!kullanici) return { hata: Response.json({ hata: "Oturumun kapanmış, tekrar giriş yap." }, { status: 401 }) };
  const site = await siteBul(id);
  if (!site || site.kullaniciId !== kullanici.id) return { hata: Response.json({ hata: "Site bulunamadı." }, { status: 404 }) };
  return { kullanici, site };
}

export async function GET(_: Request, ctx: RouteContext<"/api/siteler/[id]/yayin">) {
  const { id } = await ctx.params;
  const s = await sahibiMi(id);
  if (s.hata) return s.hata;
  if (s.site.slug) return Response.json({ slug: s.site.slug });
  return Response.json({ slug: await adresOner(id, s.site.ayarlar?.magazaAdi ?? "") });
}

export async function POST(istek: Request, ctx: RouteContext<"/api/siteler/[id]/yayin">) {
  const { id } = await ctx.params;
  const s = await sahibiMi(id);
  if (s.hata) return s.hata;
  const { kullanici, site } = s;

  // Yayına alma/kaldırma sadece Saywright onayından SONRA serbest (ilk yayın için talep gönderilir)
  if (!yayinAcikMi(kullanici.plan, site.yayinOnayi))
    return Response.json(
      { hata: "Siteni yayına almak için önce yayın talebi göndermelisin; ekibimiz onaylayınca siten yayına girer." },
      { status: 403 },
    );
  if (!site.ayarlar) return Response.json({ hata: "Önce sohbetle sitenin ilk halini oluştur." }, { status: 400 });

  const govde = (await istek.json().catch(() => ({}))) as { yayinda?: boolean; slug?: string };
  const slug = String(govde.slug ?? "").trim().toLowerCase();
  const hata = slugHatasi(slug);
  if (hata) return Response.json({ hata }, { status: 400 });
  if (await slugKullaniliyorMu(slug, id))
    return Response.json({ hata: "Bu adres başka bir mağaza tarafından kullanılıyor." }, { status: 409 });

  const guncel = await siteYayinGuncelle(id, govde.yayinda === true, slug);
  if (!guncel) return Response.json({ hata: "Bu adres az önce alındı, başka bir adres dene." }, { status: 409 });

  // Hem eski hem yeni adresin önbelleğini temizle (adres değiştiyse eskisi artık açılmasın)
  magazaOnbellegiTemizle(site.slug);
  magazaOnbellegiTemizle(guncel.slug);
  return Response.json({ yayinda: guncel.yayinda, slug: guncel.slug });
}
