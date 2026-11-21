// ─────────────────────────────────────────────────────────────
// app/panel/profil/page.tsx — Profilim: kullanıcı bilgileri ve güvenlik
// ─────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { basHarfler } from "@/lib/yardimci";
import { DigerCihazlar, HesabiSil, KisiselBilgiler, SifreDegistir } from "@/components/panel/ProfilFormlari";
import { mevcutKullanici } from "@/lib/oturum";
import { PLANLAR } from "@/lib/planlar";
import { kullanicininSiteleri } from "@/lib/veritabani";

export const metadata: Metadata = { title: "Profilim · Saywright" };

export default function ProfilSayfasi() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-6xl px-6 py-10 text-sm text-derin/60">Yükleniyor…</div>}>
      <Profil />
    </Suspense>
  );
}

function Bolum({ baslik, aciklama, children }: { baslik: string; aciklama: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-6 border-b border-cizgi py-8 last:border-0 md:grid-cols-[260px_1fr]">
      <div>
        <h2 className="font-semibold">{baslik}</h2>
        <p className="mt-1 text-sm text-derin/70">{aciklama}</p>
      </div>
      <div className="max-w-xl">{children}</div>
    </section>
  );
}

async function Profil() {
  const k = await mevcutKullanici();
  if (!k) redirect("/giris");
  const siteler = await kullanicininSiteleri(k.id);
  const plan = PLANLAR[k.plan];
  const kayit = new Date(k.kayitTarihi).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      {/* Profil kartı */}
      <section className="flex flex-col items-start gap-5 rounded-3xl border border-cizgi bg-kart p-6 sm:flex-row sm:items-center">
        <span className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl bg-derin text-2xl font-bold text-nane">
          {basHarfler(k.ad)}
        </span>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{k.ad}</h1>
          <p className="text-sm text-derin/70">{k.eposta}</p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-nane px-3 py-1 font-semibold text-derin">💎 {plan.ad} paketi</span>
            <span className="rounded-full border border-cizgi px-3 py-1 text-derin">📅 {kayit} tarihinden beri üye</span>
            <span className="rounded-full border border-cizgi px-3 py-1 text-derin">🗂️ {siteler.length} proje</span>
          </div>
        </div>
      </section>

      <div className="mt-6 rounded-3xl border border-cizgi bg-kart px-6">
        <Bolum baslik="Kişisel bilgiler" aciklama="Adın panelde ve e-postalarda görünür.">
          <KisiselBilgiler ad={k.ad} eposta={k.eposta} />
        </Bolum>
        <Bolum baslik="Şifre" aciklama="Şifreni değiştirdiğinde diğer cihazlardaki oturumların kapatılır.">
          <SifreDegistir />
        </Bolum>
        <Bolum baslik="Oturumlar" aciklama="Başka bir bilgisayarda açık unuttuysan buradan kapatabilirsin.">
          <DigerCihazlar />
        </Bolum>
        <Bolum baslik="Hesabı sil" aciklama="KVKK kapsamında verilerinin silinmesini isteyebilirsin.">
          <HesabiSil />
        </Bolum>
      </div>
    </main>
  );
}
