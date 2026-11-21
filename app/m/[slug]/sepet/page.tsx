// /m/[adres]/sepet — sepet sayfası
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import MagazaCercevesi from "@/components/magaza/MagazaCercevesi";
import SepetSayfasi from "@/components/magaza/SepetSayfasi";
import { yayindakiMagaza } from "@/lib/magazalar";
import { mevcutMusteri } from "@/lib/musteriler";

export const metadata: Metadata = { title: "Sepetim" };

export default function Sayfa({ params }: PageProps<"/m/[slug]/sepet">) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-50" />}>
      <Icerik params={params} />
    </Suspense>
  );
}

async function Icerik({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const magaza = await yayindakiMagaza(slug);
  if (!magaza) notFound();
  const musteri = await mevcutMusteri(magaza.id);

  return (
    <MagazaCercevesi ayarlar={magaza.ayarlar} slug={slug} genis>
      <SepetSayfasi slug={slug} urunler={magaza.ayarlar.urunler} renk={magaza.ayarlar.renk} girisli={!!musteri} />
    </MagazaCercevesi>
  );
}
