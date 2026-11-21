// ─────────────────────────────────────────────────────────────
// POST /api/gelistirici/plan — SADECE GELİŞTİRME İÇİN: kendi paketini değiştir
//
// Ödeme sistemi yokken Pro / Tam Hizmet deneyimini test edebilmek için.
// Yayındaki sitede (production) bu adres hiç çalışmaz → 404 döner.
// ─────────────────────────────────────────────────────────────

import { mevcutKullanici } from "@/lib/oturum";
import { PLANLAR, type PlanKodu } from "@/lib/planlar";
import { kullaniciGuncelle } from "@/lib/veritabani";

export async function POST(istek: Request) {
  if (process.env.NODE_ENV === "production") return new Response("Bulunamadı", { status: 404 });

  const kullanici = await mevcutKullanici();
  if (!kullanici) return Response.json({ hata: "Önce giriş yap." }, { status: 401 });

  const { plan } = (await istek.json().catch(() => ({}))) as { plan?: string };
  if (!plan || !(plan in PLANLAR)) return Response.json({ hata: "Geçersiz paket." }, { status: 400 });

  await kullaniciGuncelle(kullanici.id, { plan: plan as PlanKodu });
  return Response.json({ plan });
}
