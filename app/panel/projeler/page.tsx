// ─────────────────────────────────────────────────────────────
// app/panel/projeler/page.tsx — Projelerim: kullanıcının tüm siteleri
// ?filtre=hazir veya ?filtre=baslanmadi ile süzülebilir.
// ─────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import SiteKarti from "@/components/panel/SiteKarti";
import { YeniSiteButonu } from "@/components/PanelButonlari";
import { mevcutKullanici } from "@/lib/oturum";
import { PLANLAR, adminPaneliAcikMi } from "@/lib/planlar";
import { kullanicininSiteleri } from "@/lib/veritabani";

export const metadata: Metadata = { title: "Projelerim · Saywright" };

export default function ProjelerSayfasi({ searchParams }: PageProps<"/panel/projeler">) {
  return (
    <Suspense fallback={<div className="mx-auto max-w-6xl px-6 py-10 text-sm text-derin/60">Yükleniyor…</div>}>
      <Projeler searchParams={searchParams} />
    </Suspense>
  );
}

const FILTRELER = [
  { kod: "tumu", ad: "Tümü" },
  { kod: "hazir", ad: "Taslağı hazır" },
  { kod: "baslanmadi", ad: "Başlanmadı" },
] as const;

async function Projeler({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const kullanici = await mevcutKullanici();
  if (!kullanici) redirect("/giris");

  const filtre = String((await searchParams).filtre ?? "tumu");
  const plan = PLANLAR[kullanici.plan];
  const tumu = await kullanicininSiteleri(kullanici.id);
  const siteler = tumu.filter((s) => (filtre === "hazir" ? s.ayarlar : filtre === "baslanmadi" ? !s.ayarlar : true));
  const sayilar = { tumu: tumu.length, hazir: tumu.filter((s) => s.ayarlar).length, baslanmadi: tumu.filter((s) => !s.ayarlar).length };
  const kalanHak = Math.max(0, plan.siteHakki - kullanici.olusturulanSiteSayisi);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projelerim</h1>
          <p className="mt-1 text-derin/70">
            Yaptırdığın tüm siteler burada. {kalanHak > 0 ? `${kalanHak} site hakkın daha var.` : "Site hakkın doldu."}
          </p>
        </div>
        <YeniSiteButonu hakVar={kalanHak > 0} />
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {FILTRELER.map((f) => (
          <Link
            key={f.kod}
            href={f.kod === "tumu" ? "/panel/projeler" : `/panel/projeler?filtre=${f.kod}`}
            className={`rounded-full px-4 py-1.5 text-sm transition ${
              filtre === f.kod ? "bg-gece font-semibold text-white" : "border border-cizgi bg-kart text-derin hover:bg-nane/50"
            }`}
          >
            {f.ad} <span className="opacity-60">({sayilar[f.kod]})</span>
          </Link>
        ))}
      </div>

      {siteler.length === 0 ? (
        <div className="mt-6 rounded-2xl border-2 border-dashed border-cizgi bg-kart p-12 text-center">
          <p className="text-4xl">🗂️</p>
          <p className="mt-3 font-semibold">{tumu.length === 0 ? "Henüz bir projen yok" : "Bu filtreye uyan proje yok"}</p>
          <p className="mt-1 text-sm text-derin/70">
            {tumu.length === 0 ? "“+ Yeni site” butonuna bas ve hayalindeki siteyi anlat." : "Başka bir filtre seçmeyi dene."}
          </p>
        </div>
      ) : (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {siteler.map((s) => (
            <SiteKarti key={s.id} site={s} mesajSiniri={plan.siteBasinaMesaj} adminAcik={adminPaneliAcikMi(kullanici.plan)} />
          ))}
        </div>
      )}
    </main>
  );
}
