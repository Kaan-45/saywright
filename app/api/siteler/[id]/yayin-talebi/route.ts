// ─────────────────────────────────────────────────────────────
// /api/siteler/[id]/yayin-talebi — Müşterinin "Yayınla" talebi
//   POST   → { slug, alanAdi, alanAdiTuru } ile yeni talep gönderir
//   DELETE → bekleyen talebi geri çeker
// Talebi onaylamak / reddetmek Saywright admin panelinden (/admin) yapılır.
// ─────────────────────────────────────────────────────────────

import { alanAdiHatasi, bagliAlanAdiHatasi } from "@/lib/alanAdi";
import { odemeKoduUret } from "@/lib/odeme";
import { DOGRULAMA_GEREKLI, mevcutKullanici } from "@/lib/oturum";
import { PLANLAR } from "@/lib/planlar";
import { siteBul, slugKullaniliyorMu } from "@/lib/veritabani";
import { onayliSiteSayisi, siteninSonTalebi, talepIptal, talepOlustur } from "@/lib/yayinTalepleri";
import { slugHatasi } from "@/lib/yardimci";

const hata = (mesaj: string, status: number) => Response.json({ hata: mesaj }, { status });

async function sahibiMi(id: string) {
  const kullanici = await mevcutKullanici();
  if (!kullanici) return { yanit: hata("Oturumun kapanmış, tekrar giriş yap.", 401) } as const;
  const site = await siteBul(id);
  if (!site || site.kullaniciId !== kullanici.id) return { yanit: hata("Site bulunamadı.", 404) } as const;
  return { kullanici, site };
}

export async function POST(istek: Request, ctx: RouteContext<"/api/siteler/[id]/yayin-talebi">) {
  const { id } = await ctx.params;
  const s = await sahibiMi(id);
  if ("yanit" in s) return s.yanit;
  const { kullanici, site } = s;

  if (!kullanici.epostaDogrulandi) return hata(DOGRULAMA_GEREKLI, 403);
  if (!site.ayarlar) return hata("Önce sohbetle sitenin ilk halini oluştur.", 400);
  if (site.yayinOnayi) return hata("Bu site zaten onaylı. Yayın durumunu admin panelinden yönetebilirsin.", 400);

  const govde = (await istek.json().catch(() => ({}))) as { slug?: string; alanAdi?: string | null; alanAdiTuru?: string | null };

  // 1) Saywright adresi
  const slug = String(govde.slug ?? "").trim().toLowerCase();
  const slugHata = slugHatasi(slug);
  if (slugHata) return hata(slugHata, 400);
  if (await slugKullaniliyorMu(slug, id)) return hata("Bu adres başka bir mağaza tarafından kullanılıyor.", 409);

  // 2) Kendi alan adı (isteğe bağlı)
  const alanAdiTuru = govde.alanAdiTuru === "yeni" || govde.alanAdiTuru === "mevcut" ? govde.alanAdiTuru : null;
  const alanAdi = alanAdiTuru ? String(govde.alanAdi ?? "").trim().toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "") : null;
  if (alanAdiTuru && alanAdi) {
    const h = alanAdiTuru === "yeni" ? alanAdiHatasi(alanAdi) : bagliAlanAdiHatasi(alanAdi);
    if (h) return hata(h, 400);
  } else if (alanAdiTuru) return hata("Alan adını yaz ya da 'Şimdilik istemiyorum'u seç.", 400);

  // 3) Paket ve ödeme
  let istenenPlan: "pro" | null = null;
  if (kullanici.plan === "ucretsiz") {
    istenenPlan = "pro"; // yayın için Pro gerekli (Tam Hizmet henüz satışta değil)
  } else if ((await onayliSiteSayisi(kullanici.id, id)) >= PLANLAR[kullanici.plan].yayinHakki) {
    return hata(
      `${PLANLAR[kullanici.plan].ad} paketin ${PLANLAR[kullanici.plan].yayinHakki} yayında site içeriyor. Ek site için bizimle iletişime geç.`,
      403,
    );
  }
  const tutarKurus = istenenPlan ? PLANLAR[istenenPlan].fiyat * 100 : 0;

  const talep = await talepOlustur({
    kullaniciId: kullanici.id,
    siteId: id,
    slug,
    alanAdi: alanAdiTuru ? alanAdi : null,
    alanAdiTuru,
    istenenPlan,
    tutarKurus,
    odemeKodu: odemeKoduUret(),
  });
  if (!talep) return hata("Bu site için zaten bekleyen bir talebin var.", 409);
  return Response.json({ talep });
}

export async function DELETE(_: Request, ctx: RouteContext<"/api/siteler/[id]/yayin-talebi">) {
  const { id } = await ctx.params;
  const s = await sahibiMi(id);
  if ("yanit" in s) return s.yanit;

  const son = await siteninSonTalebi(id);
  if (!son || son.durum !== "bekliyor" || !(await talepIptal(son.id, s.kullanici.id)))
    return hata("Geri çekilecek bekleyen bir talep yok.", 404);
  return Response.json({ tamam: true });
}
