// ─────────────────────────────────────────────────────────────
// /m/[adres]/siparis/[kod] — sipariş detayı / onay sayfası
// Sadece siparişi veren müşteri görebilir. ?yeni=1 ile gelindiyse "Teşekkürler" başlığı çıkar.
// ─────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import MagazaCercevesi from "@/components/magaza/MagazaCercevesi";
import SiparisDetayi, { DurumCizgisi, DurumRozeti } from "@/components/SiparisDetayi";
import { yayindakiMagaza } from "@/lib/magazalar";
import { mevcutMusteri } from "@/lib/musteriler";
import { siparisBul } from "@/lib/siparisler";

export const metadata: Metadata = { title: "Siparişim" };

export default function Sayfa({ params, searchParams }: PageProps<"/m/[slug]/siparis/[kod]">) {
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
  params: Promise<{ slug: string; kod: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug, kod } = await params;
  const yeni = (await searchParams).yeni === "1";
  const magaza = await yayindakiMagaza(slug);
  if (!magaza) notFound();
  const musteri = await mevcutMusteri(magaza.id);
  if (!musteri) redirect(`/m/${slug}/giris`);
  const siparis = await siparisBul(magaza.id, kod.toUpperCase());
  if (!siparis || siparis.musteriId !== musteri.id) notFound(); // başkasının siparişi görünmez

  const { renk } = magaza.ayarlar;
  const tarih = new Date(siparis.olusturma).toLocaleString("tr-TR", { dateStyle: "long", timeStyle: "short" });

  return (
    <MagazaCercevesi ayarlar={magaza.ayarlar} slug={slug} genis>
      {yeni && (
        <div className="mb-6 rounded-3xl p-8 text-center text-white" style={{ background: renk.ana }}>
          <p className="text-5xl">🎉</p>
          <h1 className="mt-3 text-2xl font-bold">Siparişin alındı, teşekkürler!</h1>
          <p className="mt-1 text-white/85">
            {magaza.ayarlar.magazaAdi} siparişini en kısa sürede hazırlayacak. Durumunu buradan takip edebilirsin.
          </p>
        </div>
      )}
      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm text-zinc-500">Sipariş numarası</p>
            <p className="font-mono text-2xl font-bold tracking-widest">{siparis.kod}</p>
            <p className="text-xs text-zinc-400">{tarih}</p>
          </div>
          <DurumRozeti durum={siparis.durum} />
        </div>
        <div className="mt-6">
          <DurumCizgisi durum={siparis.durum} renk={renk.ana} />
        </div>
        <div className="mt-6">
          <SiparisDetayi siparis={siparis} />
        </div>
      </section>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link href={`/m/${slug}/hesabim`} className="rounded-xl border border-zinc-300 bg-white px-5 py-2.5 text-sm font-semibold hover:bg-zinc-50">
          Tüm siparişlerim
        </Link>
        <Link href={`/m/${slug}`} className="rounded-xl px-5 py-2.5 text-sm font-bold text-white" style={{ background: renk.ana }}>
          Alışverişe devam et
        </Link>
      </div>
    </MagazaCercevesi>
  );
}
