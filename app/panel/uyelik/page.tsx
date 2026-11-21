// ─────────────────────────────────────────────────────────────
// app/panel/uyelik/page.tsx — Üyeliğim: paket, kullanım ve yükseltme seçenekleri
// ─────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import GelistiriciPlanSecici from "@/components/panel/GelistiriciPlanSecici";
import { mevcutKullanici } from "@/lib/oturum";
import { PLANLAR, type PlanKodu } from "@/lib/planlar";
import { kullanicininSiteleri } from "@/lib/veritabani";

export const metadata: Metadata = { title: "Üyeliğim · Saywright" };

export default function UyelikSayfasi() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-6xl px-6 py-10 text-sm text-derin/60">Yükleniyor…</div>}>
      <Uyelik />
    </Suspense>
  );
}

function Cubuk({ etiket, kullanilan, sinir }: { etiket: string; kullanilan: number; sinir: number }) {
  const oran = Math.min(100, (kullanilan / sinir) * 100);
  return (
    <div>
      <div className="flex justify-between text-sm">
        <span className="text-derin">{etiket}</span>
        <span className="font-semibold">
          {kullanilan} / {sinir}
        </span>
      </div>
      <div className="mt-1.5 h-2 rounded-full bg-nane/60">
        <div className={`h-2 rounded-full ${oran >= 100 ? "bg-rose-500" : oran >= 80 ? "bg-amber-500" : "bg-deniz"}`} style={{ width: `${oran}%` }} />
      </div>
    </div>
  );
}

const fiyatYazisi = (kod: PlanKodu) => {
  const p = PLANLAR[kod];
  if (p.odeme === "ucretsiz") return "Ücretsiz";
  return `${p.fiyat.toLocaleString("tr-TR")} ₺ ${p.odeme === "tek" ? "· tek seferlik" : "/ ay"}`;
};

async function Uyelik() {
  const k = await mevcutKullanici();
  if (!k) redirect("/giris");
  const plan = PLANLAR[k.plan];
  const siteler = await kullanicininSiteleri(k.id);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <h1 className="text-3xl font-bold tracking-tight">Üyeliğim</h1>
      <p className="mt-1 text-derin/70">Paketini, kullanım haklarını ve yükseltme seçeneklerini buradan takip et.</p>

      {/* Sadece geliştirme sırasında (npm run dev) görünür */}
      {process.env.NODE_ENV !== "production" && (
        <GelistiriciPlanSecici
          mevcut={k.plan}
          planlar={(Object.keys(PLANLAR) as PlanKodu[]).map((kod) => ({ kod, ad: PLANLAR[kod].ad }))}
        />
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Mevcut paket */}
        <section className="rounded-3xl bg-gece p-6 text-white sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-nane">Mevcut paketin</p>
          <div className="mt-2 flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-3xl font-extrabold">{plan.ad}</h2>
            <span className="text-white/70">{fiyatYazisi(k.plan)}</span>
          </div>
          <p className="mt-1 text-white/70">{plan.neAlirsin}</p>
          <ul className="mt-6 grid gap-2 text-sm sm:grid-cols-2">
            {plan.ozellikler.map((o) => (
              <li key={o} className="flex gap-2">
                <span className="text-nane">✓</span>
                {o}
              </li>
            ))}
          </ul>
        </section>

        {/* Kullanım */}
        <section className="space-y-5 rounded-3xl border border-cizgi bg-kart p-6">
          <h2 className="font-semibold">Kullanım</h2>
          <Cubuk etiket="Site oluşturma hakkı" kullanilan={k.olusturulanSiteSayisi} sinir={plan.siteHakki} />
          <div className="space-y-3 border-t border-cizgi pt-4">
            <p className="text-sm font-medium">Site başına yapay zeka mesajı</p>
            {siteler.length === 0 && <p className="text-sm text-derin/60">Henüz bir site oluşturmadın.</p>}
            {siteler.map((s) => (
              <Cubuk key={s.id} etiket={s.ayarlar?.magazaAdi ?? "Adsız site"} kullanilan={s.yapayZekaMesajSayisi} sinir={plan.siteBasinaMesaj} />
            ))}
          </div>
        </section>
      </div>

      {/* Paketler */}
      <h2 className="mt-12 text-xl font-bold">Paket seçenekleri</h2>
      <div className="mt-4 grid gap-5 lg:grid-cols-3">
        {(Object.keys(PLANLAR) as PlanKodu[]).map((kod) => {
          const p = PLANLAR[kod];
          const mevcut = kod === k.plan;
          return (
            <div key={kod} className={`flex flex-col rounded-3xl border p-6 ${mevcut ? "border-deniz bg-nane/40" : "border-cizgi bg-kart"}`}>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">{p.ad}</h3>
                {mevcut && <span className="rounded-full bg-gece px-2.5 py-1 text-[11px] font-semibold text-nane">Mevcut paketin</span>}
              </div>
              <p className="mt-1 text-2xl font-extrabold">{fiyatYazisi(kod)}</p>
              <p className="mt-1 text-sm text-derin/80">{p.kimIcin}</p>
              <p className="mt-3 inline-block w-fit rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-derin">👤 {p.kimYonetir}</p>
              <ul className="mt-4 flex-1 space-y-2 text-sm">
                {p.ozellikler.map((o) => (
                  <li key={o} className="flex gap-2">
                    <span className="text-deniz">✓</span>
                    {o}
                  </li>
                ))}
              </ul>
              {mevcut ? (
                <span className="mt-6 rounded-xl bg-white/60 py-2.5 text-center text-sm font-semibold text-derin">Kullanıyorsun</span>
              ) : kod === "ucretsiz" ? (
                <span className="mt-6 rounded-xl bg-white/60 py-2.5 text-center text-sm font-semibold text-derin/70">Temel paket</span>
              ) : p.satista ? (
                <Link
                  href="/panel/projeler"
                  className="mt-6 rounded-xl bg-gece py-2.5 text-center text-sm font-semibold text-white hover:bg-derin"
                  title="Projelerim'de bir sitenin 🚀 Yayınla butonuna bas"
                >
                  Bir siteni yayınlarken seç →
                </Link>
              ) : (
                <span className="mt-6 rounded-xl bg-zemin py-2.5 text-center text-sm font-semibold text-derin/70">Çok yakında</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Ödeme geçmişi */}
      <section className="mt-12 rounded-3xl border border-cizgi bg-kart p-6">
        <h2 className="font-semibold">Ödeme geçmişi</h2>
        <div className="mt-4 rounded-2xl border-2 border-dashed border-cizgi p-8 text-center">
          <p className="text-3xl">🧾</p>
          <p className="mt-2 text-sm text-derin/70">Henüz bir ödemen yok. Paket satın aldığında faturaların burada listelenecek.</p>
        </div>
        <p className="mt-4 text-xs text-derin/60">
          Paketlerle ilgili sorun mu var?{" "}
          <Link href="/#sss" className="font-semibold text-deniz hover:underline">
            Sıkça sorulan sorulara göz at
          </Link>
          .
        </p>
      </section>
    </main>
  );
}
