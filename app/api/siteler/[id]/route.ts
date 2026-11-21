// ─────────────────────────────────────────────────────────────
// PUT /api/siteler/[id] — Admin panelinden gelen değişiklikleri kaydeder
//
// Kontroller: giriş yapmış mı? site onun mu? planı admin paneline izin veriyor mu?
// gönderilen veri doğru şekilde mi? Hepsi geçerse kaydeder.
// ─────────────────────────────────────────────────────────────

import { magazaOnbellegiTemizle } from "@/lib/magazalar";
import { mevcutKullanici } from "@/lib/oturum";
import { adminPaneliAcikMi } from "@/lib/planlar";
import { siteAyarKaydet, siteBul } from "@/lib/veritabani";
import { AyarSemasi, ayarHatasi, semadanAyar } from "@/templates/magaza/sema";

export async function PUT(istek: Request, ctx: RouteContext<"/api/siteler/[id]">) {
  const { id } = await ctx.params;
  const kullanici = await mevcutKullanici();
  if (!kullanici) return Response.json({ hata: "Oturumun kapanmış, tekrar giriş yap." }, { status: 401 });

  const site = await siteBul(id);
  if (!site || site.kullaniciId !== kullanici.id) return Response.json({ hata: "Site bulunamadı." }, { status: 404 });
  if (!adminPaneliAcikMi(kullanici.plan))
    return Response.json({ hata: "Admin paneli Pro pakete özel." }, { status: 403 });

  const govde = await istek.json().catch(() => null);
  const kontrol = AyarSemasi.safeParse(govde?.ayarlar);
  if (!kontrol.success) return Response.json({ hata: "Gönderilen veri hatalı." }, { status: 400 });

  const ayarlar = semadanAyar(kontrol.data);
  const hata = ayarHatasi(ayarlar);
  if (hata) return Response.json({ hata }, { status: 400 });

  const surum = Number(govde?.surum);
  if (!Number.isInteger(surum)) return Response.json({ hata: "Gönderilen veri hatalı." }, { status: 400 });

  const sonuc = await siteAyarKaydet(id, ayarlar, surum);
  if (sonuc === "cakisma")
    // Panel açıkken sitende başka bir değişiklik oldu (örn. yeni sipariş geldi ve stok düştü)
    return Response.json(
      { hata: "Bu arada sitende değişiklik oldu (örneğin yeni bir sipariş). Sayfayı yenileyip tekrar dene.", cakisma: true },
      { status: 409 },
    );
  magazaOnbellegiTemizle(site.slug); // yayındaysa ziyaretçiler güncel hali görsün
  return Response.json({ ayarlar: sonuc.ayarlar, surum: sonuc.surum });
}
