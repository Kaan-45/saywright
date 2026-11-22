// ─────────────────────────────────────────────────────────────
// POST /api/misafir — "Misafir olarak dene" (sadece demo modunda)
// Geçici hesap açar, giriş yaptırır, boş bir site oluşturup id'sini döner.
// ─────────────────────────────────────────────────────────────

import { randomBytes } from "crypto";
import { demoModu } from "@/lib/demo";
import { eskiMisafirleriSil, misafirEpostasiUret, misafirSiniriDoluMu } from "@/lib/misafir";
import { oturumAc, sifreHashle } from "@/lib/oturum";
import { PLANLAR } from "@/lib/planlar";
import { kullaniciOlustur, siteOlustur } from "@/lib/veritabani";

export async function POST() {
  if (!demoModu()) return Response.json({ hata: "Misafir girişi şu an kapalı. Ücretsiz kaydolabilirsin." }, { status: 403 });

  await eskiMisafirleriSil(); // her yeni misafirde eskileri temizle (ayrı bir zamanlayıcıya gerek kalmasın)
  if (await misafirSiniriDoluMu())
    return Response.json({ hata: "Şu an çok fazla deneme var, birazdan tekrar dene ya da ücretsiz kaydol." }, { status: 429 });

  const kullanici = await kullaniciOlustur("Misafir", misafirEpostasiUret(), sifreHashle(randomBytes(24).toString("hex")));
  await oturumAc(kullanici.id);
  const site = await siteOlustur(kullanici.id, PLANLAR[kullanici.plan].siteHakki);
  return Response.json({ siteId: site?.id ?? null });
}
