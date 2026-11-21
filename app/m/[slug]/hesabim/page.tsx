// ─────────────────────────────────────────────────────────────
// /m/[adres]/hesabim — mağaza müşterisinin hesap sayfası
// Bilgilerim · Siparişlerim (bir sonraki adımda) · Şifre · Hesabı sil
// ─────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { BilgilerFormu, CikisYap, HesabiSil, SifreFormu } from "@/components/magaza/HesapFormlari";
import MagazaCercevesi from "@/components/magaza/MagazaCercevesi";
import { yayindakiMagaza } from "@/lib/magazalar";
import { mevcutMusteri } from "@/lib/musteriler";
import { tlYaz } from "@/lib/siparis";
import { musterininSiparisleri } from "@/lib/siparisler";
import { DurumRozeti } from "@/components/SiparisDetayi";
import { basHarfler } from "@/lib/yardimci";

export const metadata: Metadata = { title: "Hesabım" };

export default function Sayfa({ params }: PageProps<"/m/[slug]/hesabim">) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-50" />}>
      <Icerik params={params} />
    </Suspense>
  );
}

function Kart({ baslik, children }: { baslik: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5">
      <h2 className="mb-4 text-lg font-bold">{baslik}</h2>
      {children}
    </section>
  );
}

async function Icerik({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const magaza = await yayindakiMagaza(slug);
  if (!magaza) notFound();
  const musteri = await mevcutMusteri(magaza.id);
  if (!musteri) redirect(`/m/${slug}/giris`);

  const { renk } = magaza.ayarlar;
  const siparislerim = await musterininSiparisleri(magaza.id, musteri.id);
  const uyelik = new Date(musteri.kayitTarihi).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });

  return (
    <MagazaCercevesi ayarlar={magaza.ayarlar} slug={slug} genis>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="grid h-16 w-16 place-items-center rounded-2xl text-xl font-bold text-white" style={{ background: renk.ana }}>
            {basHarfler(musteri.ad)}
          </span>
          <div>
            <h1 className="text-2xl font-bold">Merhaba, {musteri.ad.split(" ")[0]} 👋</h1>
            <p className="text-sm text-zinc-500">{uyelik} tarihinden beri üyesin</p>
          </div>
        </div>
        <CikisYap slug={slug} />
      </div>

      <div className="mt-8 grid gap-6">
        <Kart baslik="📦 Siparişlerim">
          {siparislerim.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-zinc-200 p-8 text-center">
              <p className="text-sm text-zinc-500">Henüz siparişin yok.</p>
              <Link href={`/m/${slug}#urunler`} className="mt-4 inline-block rounded-xl px-5 py-2.5 text-sm font-bold text-white" style={{ background: renk.ana }}>
                Alışverişe başla
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-zinc-100">
              {siparislerim.map((s) => (
                <li key={s.id}>
                  <Link href={`/m/${slug}/siparis/${s.kod}`} className="flex flex-wrap items-center justify-between gap-3 py-3 hover:opacity-80">
                    <div>
                      <p className="font-mono font-bold tracking-wider">{s.kod}</p>
                      <p className="text-xs text-zinc-500">
                        {new Date(s.olusturma).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })} ·{" "}
                        {s.kalemler.map((k) => k.emoji).join(" ")} {s.kalemler.reduce((t, k) => t + k.adet, 0)} ürün
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold">{tlYaz(s.toplamKurus)}</span>
                      <DurumRozeti durum={s.durum} />
                      <span className="text-zinc-400">›</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Kart>
        <Kart baslik="👤 Bilgilerim">
          <BilgilerFormu slug={slug} renk={renk} ad={musteri.ad} eposta={musteri.eposta} telefon={musteri.telefon} />
        </Kart>
        <Kart baslik="🔑 Şifre">
          <SifreFormu slug={slug} renk={renk} />
        </Kart>
        <Kart baslik="🛡️ Gizlilik">
          <p className="mb-4 text-sm text-zinc-600">
            Kişisel verilerin{" "}
            <Link href={`/m/${slug}/kvkk`} className="font-semibold underline">
              KVKK Aydınlatma Metni
            </Link>{" "}
            kapsamında işleniyor. Dilediğin zaman hesabını ve verilerini silebilirsin.
          </p>
          <HesabiSil slug={slug} />
        </Kart>
      </div>
    </MagazaCercevesi>
  );
}
