// /m/[adres]/giris — mağaza müşterisi giriş sayfası
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import MagazaCercevesi from "@/components/magaza/MagazaCercevesi";
import MusteriFormu from "@/components/magaza/MusteriFormu";
import { yayindakiMagaza } from "@/lib/magazalar";
import { mevcutMusteri } from "@/lib/musteriler";

export const metadata: Metadata = { title: "Giriş yap" };

export default function Sayfa({ params, searchParams }: PageProps<"/m/[slug]/giris">) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-50" />}>
      <Icerik params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function Icerik({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const devam = (await searchParams).devam === "odeme" ? ("odeme" as const) : undefined;
  const magaza = await yayindakiMagaza(slug);
  if (!magaza) notFound();
  if (await mevcutMusteri(magaza.id)) redirect(`/m/${slug}/${devam ?? "hesabim"}`); // zaten giriş yapmış

  return (
    <MagazaCercevesi ayarlar={magaza.ayarlar} slug={slug}>
      <MusteriFormu tur="giris" slug={slug} magazaAdi={magaza.ayarlar.magazaAdi} renk={magaza.ayarlar.renk} devam={devam} />
    </MagazaCercevesi>
  );
}
