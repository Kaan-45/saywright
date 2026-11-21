// GET /api/siteler/[id]/siparisler — mağaza sahibi: tüm siparişler (yenile butonu için)
import { mevcutKullanici } from "@/lib/oturum";
import { siteninSiparisleri } from "@/lib/siparisler";
import { siteBul } from "@/lib/veritabani";

export async function GET(_: Request, ctx: RouteContext<"/api/siteler/[id]/siparisler">) {
  const { id } = await ctx.params;
  const kullanici = await mevcutKullanici();
  if (!kullanici) return Response.json({ hata: "Oturumun kapanmış." }, { status: 401 });
  const site = await siteBul(id);
  if (!site || site.kullaniciId !== kullanici.id) return Response.json({ hata: "Site bulunamadı." }, { status: 404 });
  return Response.json({ siparisler: await siteninSiparisleri(id) });
}
