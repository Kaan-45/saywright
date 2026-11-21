// POST /api/siteler — yeni site oluştur (1 hak harcar)
import { DOGRULAMA_GEREKLI, mevcutKullanici } from "@/lib/oturum";
import { PLANLAR } from "@/lib/planlar";
import { siteOlustur } from "@/lib/veritabani";

export async function POST() {
  const kullanici = await mevcutKullanici();
  if (!kullanici) return Response.json({ hata: "Önce giriş yapmalısın." }, { status: 401 });
  // Sahte e-postalarla açılan hesaplar ücretsiz hakları sömürmesin
  if (!kullanici.epostaDogrulandi) return Response.json({ hata: DOGRULAMA_GEREKLI }, { status: 403 });

  const site = await siteOlustur(kullanici.id, PLANLAR[kullanici.plan].siteHakki);
  if (!site)
    return Response.json(
      { hata: "Ücretsiz site hakların doldu. Pro üyelik çok yakında!" },
      { status: 403 },
    );
  return Response.json({ id: site.id });
}
