// ─────────────────────────────────────────────────────────────
// SiteOnizleme.tsx — Örnek siteyi doğru şablonla çizer
//   SiteGoster   → tam boyutlu
//   MiniOnizleme → küçültülmüş (kartlardaki "fotoğraf")
// ─────────────────────────────────────────────────────────────

import MagazaSablonu from "@/templates/magaza/MagazaSablonu";
import RestoranSablonu from "@/templates/restoran/RestoranSablonu";
import type { OrnekSite } from "./ornekSiteler";

export function SiteGoster({ site }: { site: OrnekSite }) {
  return site.tur === "magaza" ? <MagazaSablonu ayarlar={site.ayarlar} /> : <RestoranSablonu ayarlar={site.ayarlar} />;
}

// Siteyi 1/ÖLÇEK genişlikte çizip ÖLÇEK oranında küçültüyoruz:
// böylece kart içinde "masaüstü görünümü" küçük bir fotoğraf gibi durur.
export function MiniOnizleme({ site, olcek = 0.4, yukseklik = "h-72" }: { site: OrnekSite; olcek?: number; yukseklik?: string }) {
  return (
    <div className={`pointer-events-none overflow-hidden ${yukseklik}`} aria-hidden>
      <div style={{ width: `${100 / olcek}%`, transform: `scale(${olcek})`, transformOrigin: "top left" }}>
        <SiteGoster site={site} />
      </div>
    </div>
  );
}
