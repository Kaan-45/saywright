// ─────────────────────────────────────────────────────────────
// app/panel/layout.tsx — /panel altındaki TÜM sayfaların ortak çerçevesi
// (Genel bakış, Projelerim, Üyeliğim, Profilim). Üst menü burada bir kez çizilir.
// ─────────────────────────────────────────────────────────────

import { Suspense } from "react";
import DogrulamaUyarisi from "@/components/panel/DogrulamaUyarisi";
import PanelMenu from "@/components/panel/PanelMenu";
import { epostaServisiVarMi } from "@/lib/eposta";
import { MISAFIR_OMRU_SAAT, misafirMi } from "@/lib/misafir";
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
      {misafirMi(k.eposta) && (
        <p className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-xs text-amber-800">
          🎟️ Misafir hesabıyla deniyorsun. Bu hesap ve siteleri {MISAFIR_OMRU_SAAT} saat sonra otomatik silinir.
        </p>
      )}
      {/* E-posta servisi yoksa (canlı demo) doğrulama linki gönderilemez; uyarıyı göstermiyoruz. Geliştirmede link panelde çıkar. */}
      {!k.epostaDogrulandi && (epostaServisiVarMi() || process.env.NODE_ENV !== "production") && <DogrulamaUyarisi eposta={k.eposta} />}
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
