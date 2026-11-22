// ─────────────────────────────────────────────────────────────
// app/panel/yayinla/[id]/page.tsx — Yayın sihirbazı
// Müşteri burada adresini ve alan adını seçip yayın talebi gönderir,
// sonra talebinin durumunu (bekliyor / reddedildi / onaylandı) buradan takip eder.
// ─────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import YayinSihirbazi from "@/components/yayin/YayinSihirbazi";
import { alanAdiKokuOner } from "@/lib/alanAdi";
import { havaleBilgileri } from "@/lib/odeme";
import { mevcutKullanici } from "@/lib/oturum";
import { ALAN_ADI_BUTCESI, PLANLAR } from "@/lib/planlar";
import { adresOner, siteBul } from "@/lib/veritabani";
import { onayliSiteSayisi, siteninSonTalebi } from "@/lib/yayinTalepleri";

export const metadata: Metadata = { title: "Siteni yayınla · Saywright" };

export default function YayinlaSayfasi({ params }: PageProps<"/panel/yayinla/[id]">) {
  return (
    <Suspense fallback={<div className="mx-auto max-w-3xl px-6 py-10 text-sm text-derin/60">Yükleniyor…</div>}>
      <Icerik params={params} />
    </Suspense>
  );
}

async function Icerik({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const k = await mevcutKullanici();
  if (!k) redirect("/giris");
  const site = await siteBul(id);
  if (!site || site.kullaniciId !== k.id) notFound();
  if (!site.ayarlar) redirect(`/olustur/${site.id}`);

  // Yayınlanınca hangi pakette olacak? Ücretsizse Pro'ya geçecek.
  const hedefPlan = k.plan === "ucretsiz" ? "pro" : k.plan;
  const hakDolu = k.plan !== "ucretsiz" && (await onayliSiteSayisi(k.id, id)) >= PLANLAR[k.plan].yayinHakki;

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
      <YayinSihirbazi
        siteId={site.id}
        magazaAdi={site.ayarlar.magazaAdi}
        onayli={!!site.yayinOnayi}
        yayinda={site.yayinda}
        mevcutSlug={site.slug}
        bagliAlanAdi={site.alanAdi}
        onerilenSlug={site.slug ?? (await adresOner(site.id, site.ayarlar.magazaAdi))}
        onerilenKok={alanAdiKokuOner(site.ayarlar.magazaAdi)}
        sonTalep={await siteninSonTalebi(site.id)}
        havale={havaleBilgileri()}
        paket={{
          mevcutAd: PLANLAR[k.plan].ad,
          odemeGerekli: k.plan === "ucretsiz",
          hedefAd: PLANLAR[hedefPlan].ad,
          fiyat: PLANLAR[hedefPlan].fiyat,
          alanAdiButcesi: ALAN_ADI_BUTCESI[hedefPlan],
          hakDolu: hakDolu ? `${PLANLAR[k.plan].ad} paketin ${PLANLAR[k.plan].yayinHakki} yayında site içeriyor.` : null,
        }}
      />
    </main>
  );
}
