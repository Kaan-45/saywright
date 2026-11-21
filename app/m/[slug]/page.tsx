// ─────────────────────────────────────────────────────────────
// app/m/[slug]/page.tsx — Herkese açık mağaza sayfası
// Örn: localhost:3000/m/lavmira-mum
//
// Giriş gerektirmez. Sadece "yayında" olan mağazalar görünür;
// yayında değilse veya adres yanlışsa "bulunamadı" sayfası açılır.
// ─────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { yayindakiMagaza } from "@/lib/magazalar";
import { mevcutMusteri } from "@/lib/musteriler";
import MagazaSablonu from "@/templates/magaza/MagazaSablonu";

// Tarayıcı sekmesindeki başlık ve Google'da görünecek açıklama
export async function generateMetadata({ params }: PageProps<"/m/[slug]">): Promise<Metadata> {
  const magaza = await yayindakiMagaza((await params).slug);
  if (!magaza) return { title: "Mağaza bulunamadı" };
  return { title: magaza.ayarlar.magazaAdi, description: magaza.ayarlar.slogan };
}

export default function MagazaSayfasi({ params }: PageProps<"/m/[slug]">) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <Magaza params={params} />
    </Suspense>
  );
}

async function Magaza({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const magaza = await yayindakiMagaza(slug);
  if (!magaza) notFound();

  // Ziyaretçi bu mağazaya giriş yapmış mı? Üst menüdeki "Hesabım" ona göre değişir.
  const musteri = await mevcutMusteri(magaza.id);
  const hesap = musteri
    ? { href: `/m/${slug}/hesabim`, etiket: musteri.ad.split(" ")[0] }
    : { href: `/m/${slug}/giris`, etiket: "Giriş yap" };

  return (
    <div className="min-h-screen bg-white">
      <MagazaSablonu ayarlar={magaza.ayarlar} hesap={hesap} sepetSlug={slug} />
      {/* Saywright tanıtım rozeti (sağ altta, küçük) */}
      <Link
        href="/"
        className="fixed bottom-4 right-4 z-50 flex items-center gap-1.5 rounded-full bg-[#131B2B]/90 px-3 py-1.5 text-[11px] font-medium text-[#CFEAE0] shadow-lg backdrop-blur transition hover:bg-[#131B2B]"
      >
        ✦ Saywright ile yapıldı
      </Link>
    </div>
  );
}
