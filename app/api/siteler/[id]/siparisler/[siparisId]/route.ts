// ─────────────────────────────────────────────────────────────
// PATCH /api/siteler/[id]/siparisler/[siparisId] — sipariş durumunu değiştir
// { durum: "hazirlaniyor" | "kargoda" | "teslim" | "iptal", kargoTakip?: string }
// İptal edilirse stoklar geri eklenir; bu yüzden güncel ayarları da geri döndürüyoruz.
// ─────────────────────────────────────────────────────────────

import { magazaOnbellegiTemizle } from "@/lib/magazalar";
import { mevcutKullanici } from "@/lib/oturum";
import { DURUMLAR, type SiparisDurumu } from "@/lib/siparis";
import { siparisDurumGuncelle } from "@/lib/siparisler";
import { siteBul } from "@/lib/veritabani";

export async function PATCH(istek: Request, ctx: RouteContext<"/api/siteler/[id]/siparisler/[siparisId]">) {
  const { id, siparisId } = await ctx.params;
  const kullanici = await mevcutKullanici();
  if (!kullanici) return Response.json({ hata: "Oturumun kapanmış." }, { status: 401 });
  const site = await siteBul(id);
  if (!site || site.kullaniciId !== kullanici.id) return Response.json({ hata: "Site bulunamadı." }, { status: 404 });

  const g = (await istek.json().catch(() => ({}))) as Record<string, unknown>;
  const durum = String(g.durum ?? "") as SiparisDurumu;
  if (!(durum in DURUMLAR)) return Response.json({ hata: "Geçersiz durum." }, { status: 400 });
  const takip = String(g.kargoTakip ?? "").trim().slice(0, 60) || null;

  const sonuc = await siparisDurumGuncelle(id, siparisId, durum, takip);
  if ("hata" in sonuc) return Response.json({ hata: sonuc.hata }, { status: 409 });

  let ayarlar = null;
  let surum = null;
  if (durum === "iptal") {
    magazaOnbellegiTemizle(sonuc.slug); // stok geri geldi, mağaza sayfası güncellensin
    const guncel = await siteBul(id);
    ayarlar = guncel?.ayarlar ?? null;
    surum = guncel?.surum ?? null;
  }
  return Response.json({ siparis: sonuc.siparis, ayarlar, surum });
}
