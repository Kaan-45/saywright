// ─────────────────────────────────────────────────────────────
// app/panel/page.tsx — Üye paneli: Genel bakış (localhost:3000/panel)
//
// Giriş yapmamış biri gelirse /giris sayfasına yönlendirilir.
// Next.js 16 kuralı: çerez okuyan kısım <Suspense> içinde olmalı.
// ─────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { HizliBaslat } from "@/components/PanelButonlari";
import SiteKarti from "@/components/panel/SiteKarti";
import { mevcutKullanici } from "@/lib/oturum";
import { PLANLAR, adminPaneliAcikMi } from "@/lib/planlar";
import { kullanicininSiteleri } from "@/lib/veritabani";

export const metadata: Metadata = { title: "Panelim · Saywright" };

export default function PanelSayfasi() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-6xl px-6 py-10 text-sm text-derin/60">Yükleniyor…</div>}>
      <GenelBakis />
    </Suspense>
  );
}

const IPUCLARI = [
  ["🎯", "Ne sattığını net yaz", "“Mum satıyorum” yerine “El yapımı soya mumu ve mumluk satıyorum” de."],
  ["🎨", "Renk ve tarz belirt", "“Sade, bej ve toprak tonlarında” gibi bir ifade tasarımı çok değiştirir."],
  ["🧩", "Bölümleri iste", "SSS, yorumlar, hakkımızda… İstemediğin bölümü de “kaldır” diyerek çıkarabilirsin."],
  ["⚡", "Tek mesajda birden fazla iş", "“Rengi yeşil yap, SSS ekle, kupa fiyatı 249 olsun” → hepsi tek seferde."],
];

async function GenelBakis() {
  const kullanici = await mevcutKullanici();
  if (!kullanici) redirect("/giris");

  const plan = PLANLAR[kullanici.plan];
  const siteler = await kullanicininSiteleri(kullanici.id);
  const kalanHak = Math.max(0, plan.siteHakki - kullanici.olusturulanSiteSayisi);
  const adminAcik = adminPaneliAcikMi(kullanici.plan);
  const toplamUrun = siteler.reduce((t, s) => t + (s.ayarlar?.urunler.length ?? 0), 0);
  const toplamMesaj = siteler.reduce((t, s) => t + s.yapayZekaMesajSayisi, 0);
  const ilkAd = kullanici.ad.split(" ")[0];

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      {/* ── Karşılama + hızlı başlat ── */}
      <section className="relative overflow-hidden rounded-3xl bg-gece p-6 text-white sm:p-10">
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-deniz/40 blur-3xl" />
        <div className="absolute -bottom-20 left-1/3 h-56 w-56 rounded-full bg-derin blur-3xl" />
        <div className="relative max-w-2xl">
          <p className="text-sm text-nane">Tekrar hoş geldin, {ilkAd} 👋</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            {siteler.length === 0 ? "İlk siteni birlikte kuralım." : "Bugün ne inşa ediyoruz?"}
          </h1>
          <p className="mt-2 text-white/70">
            Aklındaki siteyi tek cümleyle anlat; birkaç saniye içinde ilk taslağı hazırlayalım.
          </p>
          <div className="mt-6">
            <HizliBaslat hakVar={kalanHak > 0} />
          </div>
          {kalanHak === 0 && (
            <p className="mt-3 text-sm text-amber-200">
              Ücretsiz site hakların doldu.{" "}
              <Link href="/panel/uyelik" className="underline">
                Paketleri incele →
              </Link>
            </p>
          )}
        </div>
      </section>

      {/* ── Özet kartları ── */}
      <section className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          ["🗂️", "Projelerim", String(siteler.length), "toplam site"],
          ["🎟️", "Kalan site hakkı", `${kalanHak} / ${plan.siteHakki}`, plan.ad + " paketi"],
          ["📦", "Toplam ürün", String(toplamUrun), "tüm sitelerde"],
          ["💬", "Yapay zeka mesajı", String(toplamMesaj), "gönderildi"],
        ].map(([ikon, baslik, deger, alt]) => (
          <div key={baslik} className="rounded-2xl border border-cizgi bg-kart p-5">
            <p className="flex items-center justify-between text-sm text-derin/70">
              {baslik} <span className="text-lg">{ikon}</span>
            </p>
            <p className="mt-2 text-2xl font-extrabold">{deger}</p>
            <p className="text-xs text-derin/60">{alt}</p>
          </div>
        ))}
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* ── Son projeler ── */}
        <section>
          <div className="flex items-end justify-between">
            <h2 className="text-lg font-semibold">Son projelerim</h2>
            {siteler.length > 0 && (
              <Link href="/panel/projeler" className="text-sm font-semibold text-deniz hover:underline">
                Tümünü gör →
              </Link>
            )}
          </div>
          {siteler.length === 0 ? (
            <div className="mt-4 rounded-2xl border-2 border-dashed border-cizgi bg-kart p-10 text-center">
              <p className="text-4xl">✨</p>
              <p className="mt-3 font-semibold">Henüz bir projen yok</p>
              <p className="mt-1 text-sm text-derin/70">Yukarıdaki kutuya siteni anlatarak hemen başlayabilirsin.</p>
            </div>
          ) : (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {siteler.slice(0, 4).map((s) => (
                <SiteKarti key={s.id} site={s} mesajSiniri={plan.siteBasinaMesaj} adminAcik={adminAcik} />
              ))}
            </div>
          )}
        </section>

        {/* ── Sağ sütun ── */}
        <aside className="space-y-6">
          <div className="rounded-2xl border border-cizgi bg-kart p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-deniz">Üyeliğin</p>
            <p className="mt-1 text-xl font-bold">{plan.ad}</p>
            <p className="text-xs text-derin/70">{plan.kimYonetir}</p>
            <div className="mt-4">
              <div className="flex justify-between text-xs text-derin/70">
                <span>Site hakkı</span>
                <span>
                  {kullanici.olusturulanSiteSayisi} / {plan.siteHakki} kullanıldı
                </span>
              </div>
              <div className="mt-1 h-2 rounded-full bg-nane/60">
                <div
                  className="h-2 rounded-full bg-deniz"
                  style={{ width: `${Math.min(100, (kullanici.olusturulanSiteSayisi / plan.siteHakki) * 100)}%` }}
                />
              </div>
            </div>
            <Link
              href="/panel/uyelik"
              className="mt-4 block rounded-xl border border-cizgi bg-white/60 py-2 text-center text-sm font-semibold hover:bg-nane/50"
            >
              Üyeliği yönet
            </Link>
          </div>

          {kullanici.plan === "ucretsiz" && (
            <div className="rounded-2xl bg-derin p-5 text-white">
              <p className="text-xs font-semibold uppercase tracking-wider text-nane">Pro · tek seferlik</p>
              <p className="mt-1 text-2xl font-extrabold">{PLANLAR.pro.fiyat.toLocaleString("tr-TR")} ₺</p>
              <p className="mt-1 text-sm text-white/75">Siten yayına alınsın, admin panelin teslim edilsin. Aylık ücret yok.</p>
              <Link href="/panel/uyelik" className="mt-4 block rounded-xl bg-nane py-2 text-center text-sm font-bold text-gece hover:bg-white">
                Detayları gör
              </Link>
            </div>
          )}

          <div className="rounded-2xl border border-cizgi bg-kart p-5">
            <p className="font-semibold">💡 Daha iyi sonuç için ipuçları</p>
            <ul className="mt-3 space-y-3">
              {IPUCLARI.map(([ikon, baslik, metin]) => (
                <li key={baslik} className="flex gap-3">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-nane">{ikon}</span>
                  <div>
                    <p className="text-sm font-semibold">{baslik}</p>
                    <p className="text-xs text-derin/70">{metin}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </main>
  );
}
