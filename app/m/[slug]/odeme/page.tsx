// /m/[adres]/odeme — siparişi tamamlama (giriş gerekli)
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import MagazaCercevesi from "@/components/magaza/MagazaCercevesi";
import OdemeFormu from "@/components/magaza/OdemeFormu";
import { yayindakiMagaza } from "@/lib/magazalar";
import { mevcutMusteri } from "@/lib/musteriler";

export const metadata: Metadata = { title: "Siparişi tamamla" };

export default function Sayfa({ params }: PageProps<"/m/[slug]/odeme">) {
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
  if (!musteri) redirect(`/m/${slug}/giris?devam=odeme`);

  return (
    <MagazaCercevesi ayarlar={magaza.ayarlar} slug={slug} genis>
      <div className="mb-6 flex items-center gap-3 text-sm text-zinc-500">
        <Link href={`/m/${slug}/sepet`} className="hover:text-zinc-900">
          1. Sepet
        </Link>
        <span>→</span>
        <span className="font-semibold text-zinc-900">2. Teslimat ve ödeme</span>
        <span>→</span>
        <span>3. Onay</span>
      </div>
      <OdemeFormu
        slug={slug}
        urunler={magaza.ayarlar.urunler}
        renk={magaza.ayarlar.renk}
        varsayilan={{ adSoyad: musteri.ad, telefon: musteri.telefon ?? "" }}
      />
    </MagazaCercevesi>
  );
}
