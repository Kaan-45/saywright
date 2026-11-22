// ─────────────────────────────────────────────────────────────
// app/olustur/[id]/page.tsx — Belirli bir sitenin düzenleme ekranı
// [id] klasör adı "değişken" demek: /olustur/abc-123 → id = "abc-123"
// ─────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import Olusturucu from "@/components/Olusturucu";
import { demoModu } from "@/lib/demo";
import { mevcutKullanici } from "@/lib/oturum";
import { PLANLAR, adminPaneliAcikMi } from "@/lib/planlar";
import { siteBul } from "@/lib/veritabani";

export const metadata: Metadata = { title: "Site oluştur · Saywright" };

export default function OlusturSayfasi({ params, searchParams }: PageProps<"/olustur/[id]">) {
  return (
    <Suspense fallback={<div className="grid h-screen place-items-center text-sm text-derin/60">Yükleniyor…</div>}>
      <Icerik params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function Icerik({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const istek = (await searchParams).istek;
  const kullanici = await mevcutKullanici();
  if (!kullanici) redirect("/giris");

  const site = await siteBul(id);
  // Başkasının sitesini açmaya çalışırsa "yok" diyoruz
  if (!site || site.kullaniciId !== kullanici.id) notFound();

  const sinir = PLANLAR[kullanici.plan].siteBasinaMesaj;
  return (
    <Olusturucu
      siteId={site.id}
      ilkAyarlar={site.ayarlar}
      ilkMesajlar={site.mesajlar}
      ilkKalanMesaj={Math.max(0, sinir - site.yapayZekaMesajSayisi)}
      adminAcik={adminPaneliAcikMi(kullanici.plan)}
      ilkIstek={typeof istek === "string" ? istek.slice(0, 1000) : undefined}
      demoModu={demoModu()}
    />
  );
}
