// ─────────────────────────────────────────────────────────────
// app/yonetim/[id]/page.tsx — Bir sitenin admin paneli
//
// Kontroller: giriş yapmış mı? site onun mu? planı izin veriyor mu?
// Sitenin henüz ilk hali oluşturulmadıysa önce sohbet ekranına yönlendirir.
// ─────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import Logo from "@/components/Logo";
import YonetimPaneli from "@/components/yonetim/YonetimPaneli";
import { siteninMusterileri } from "@/lib/musteriler";
import { siteninSiparisleri } from "@/lib/siparisler";
import { mevcutKullanici } from "@/lib/oturum";
import { PLANLAR, adminPaneliAcikMi } from "@/lib/planlar";
import { siteBul } from "@/lib/veritabani";
import { siteninSonTalebi } from "@/lib/yayinTalepleri";

export const metadata: Metadata = { title: "Admin paneli · Saywright" };

export default function YonetimSayfasi({ params }: PageProps<"/yonetim/[id]">) {
  return (
    <Suspense fallback={<div className="grid h-screen place-items-center text-sm text-derin/60">Yükleniyor…</div>}>
      <Icerik params={params} />
    </Suspense>
  );
}

function BilgiEkrani({ baslik, metin, link, linkMetni }: { baslik: string; metin: string; link: string; linkMetni: string }) {
  return (
    <main className="flex min-h-screen flex-col bg-zemin px-6 py-6 text-gece">
      <Logo />
      <div className="mx-auto my-auto max-w-md rounded-3xl border border-cizgi bg-kart p-8 text-center">
        <h1 className="text-xl font-bold">{baslik}</h1>
        <p className="mt-2 text-sm text-derin">{metin}</p>
        <Link href={link} className="mt-6 inline-block rounded-xl bg-gece px-5 py-2.5 text-sm font-semibold text-white hover:bg-derin">
          {linkMetni}
        </Link>
      </div>
    </main>
  );
}

async function Icerik({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const kullanici = await mevcutKullanici();
  if (!kullanici) redirect("/giris");

  const site = await siteBul(id);
  if (!site || site.kullaniciId !== kullanici.id) notFound();

  if (!adminPaneliAcikMi(kullanici.plan))
    return (
      <BilgiEkrani
        baslik="🔒 Admin paneli Pro pakete özel"
        metin={`Ürünlerini kendin eklemek, silmek ve stok takibi yapmak için Pro pakete geçmelisin. Şu anki paketin: ${PLANLAR[kullanici.plan].ad}.`}
        link="/#fiyatlar"
        linkMetni="Paketleri incele"
      />
    );

  if (!site.ayarlar)
    return (
      <BilgiEkrani
        baslik="Önce sitenin ilk halini oluştur"
        metin="Bu site henüz boş. Sohbet ekranında siteni anlat, yapay zeka ilk halini kursun; sonra buradan yönetebilirsin."
        link={`/olustur/${site.id}`}
        linkMetni="Sohbet ekranına git"
      />
    );

  return (
    <YonetimPaneli
      siteId={site.id}
      ilkAyarlar={site.ayarlar}
      ilkSurum={site.surum}
      gelistirmeModu={!PLANLAR[kullanici.plan].adminPaneli}
      ilkYayin={{
        yayinda: site.yayinda,
        slug: site.slug,
        onayli: !!site.yayinOnayi,
        talepBekliyor: (await siteninSonTalebi(site.id))?.durum === "bekliyor",
        alanAdi: site.alanAdi,
      }}
      musteriler={await siteninMusterileri(site.id)}
      ilkSiparisler={await siteninSiparisleri(site.id)}
    />
  );
}
