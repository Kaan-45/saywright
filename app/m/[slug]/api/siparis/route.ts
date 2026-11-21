// ─────────────────────────────────────────────────────────────
// POST /m/[adres]/api/siparis — sipariş ver
// Tarayıcıdan sadece "hangi üründen kaç adet" ve teslimat bilgisi gelir.
// Fiyat, stok ve toplam tutar SUNUCUDA, mağazanın güncel verisiyle hesaplanır.
// ─────────────────────────────────────────────────────────────

import { magazaOnbellegiTemizle } from "@/lib/magazalar";
import { hata, musteriyiBul } from "@/lib/musteriApi";
import type { OdemeYontemi, Teslimat } from "@/lib/siparis";
import { siparisOlustur } from "@/lib/siparisler";

const metin = (d: unknown, min: number, max: number) => {
  const s = String(d ?? "").trim();
  return s.length >= min && s.length <= max ? s : null;
};

export async function POST(istek: Request, ctx: RouteContext<"/m/[slug]/api/siparis">) {
  const m = await musteriyiBul(ctx);
  if ("yanit" in m) return m.yanit;

  const g = (await istek.json().catch(() => ({}))) as Record<string, unknown>;

  // Sepet
  if (!Array.isArray(g.kalemler) || g.kalemler.length === 0) return hata("Sepetin boş.", 400);
  if (g.kalemler.length > 50) return hata("Sepette çok fazla ürün var.", 400);
  const istenen = (g.kalemler as Record<string, unknown>[]).map((k) => ({ ad: String(k?.ad ?? ""), adet: Number(k?.adet) }));

  // Teslimat
  const t = (g.teslimat ?? {}) as Record<string, unknown>;
  const teslimat: Partial<Teslimat> = {
    adSoyad: metin(t.adSoyad, 2, 80) ?? undefined,
    telefon: /^[0-9 +()-]{10,20}$/.test(String(t.telefon ?? "").trim()) ? String(t.telefon).trim() : undefined,
    il: metin(t.il, 2, 40) ?? undefined,
    ilce: metin(t.ilce, 2, 40) ?? undefined,
    adres: metin(t.adres, 10, 300) ?? undefined,
    not: metin(t.not, 1, 300) ?? undefined,
  };
  if (!teslimat.adSoyad) return hata("Alıcının adını yaz.", 400);
  if (!teslimat.telefon) return hata("Geçerli bir telefon numarası yaz.", 400);
  if (!teslimat.il || !teslimat.ilce) return hata("İl ve ilçeyi yaz.", 400);
  if (!teslimat.adres) return hata("Açık adresi biraz daha detaylı yaz (en az 10 karakter).", 400);

  const odeme = g.odemeYontemi;
  if (odeme !== "kapida" && odeme !== "havale") return hata("Bir ödeme yöntemi seç.", 400);

  const sonuc = await siparisOlustur({
    siteId: m.magaza.id,
    musteriId: m.musteri.id,
    eposta: m.musteri.eposta,
    istenen,
    teslimat: teslimat as Teslimat,
    odemeYontemi: odeme as OdemeYontemi,
  });
  if ("hata" in sonuc) return hata(sonuc.hata, 409);

  magazaOnbellegiTemizle(m.slug); // stoklar değişti, mağaza sayfası güncellensin
  return Response.json({ kod: sonuc.kod });
}
