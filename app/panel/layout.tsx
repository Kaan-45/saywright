// ─────────────────────────────────────────────────────────────
// app/panel/layout.tsx — /panel altındaki TÜM sayfaların ortak çerçevesi
// (Genel bakış, Projelerim, Üyeliğim, Profilim). Üst menü burada bir kez çizilir.
// ─────────────────────────────────────────────────────────────

import { Suspense } from "react";
import DogrulamaUyarisi from "@/components/panel/DogrulamaUyarisi";
import PanelMenu from "@/components/panel/PanelMenu";
import { mevcutKullanici } from "@/lib/oturum";
import { PLANLAR } from "@/lib/planlar";

async function UstMenu() {
  const k = await mevcutKullanici();
  if (!k) return null; // sayfanın kendisi /giris'e yönlendirecek
  const plan = PLANLAR[k.plan];
  return (
    <>
      <PanelMenu
      ad={k.ad}
      eposta={k.eposta}
      planAdi={plan.ad}
      hakVar={k.olusturulanSiteSayisi < plan.siteHakki}
      admin={k.rol === "admin"}
      />
      {!k.epostaDogrulandi && <DogrulamaUyarisi eposta={k.eposta} />}
    </>
  );
}

export default function PanelDuzeni({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zemin text-gece">
      <Suspense fallback={<div className="h-[61px] border-b border-cizgi bg-kart" />}>
        <UstMenu />
      </Suspense>
      {children}
    </div>
  );
}
