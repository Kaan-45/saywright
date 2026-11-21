// ─────────────────────────────────────────────────────────────
// SepetBilesenleri.tsx — Mağaza şablonunun içindeki etkileşimli sepet parçaları
// (Sadece YAYINDAKİ mağazada kullanılır; önizlemelerde normal, tıklanmayan butonlar görünür.)
// ─────────────────────────────────────────────────────────────
"use client";

import { useState, useSyncExternalStore } from "react";
import { sepeteEkle, sepetiDinle, sepetiOku, type SepetKalemi } from "@/lib/sepetIstemci";

const SUNUCU_SEPETI: SepetKalemi[] = []; // React her seferinde AYNI boş diziyi görmeli

export function useSepet(slug: string) {
  return useSyncExternalStore(
    sepetiDinle,
    () => sepetiOku(slug),
    () => SUNUCU_SEPETI, // sunucuda sepet yok
  );
}

export function SepeteEkleButonu({ slug, urunAdi, renk }: { slug: string; urunAdi: string; renk: string }) {
  const [eklendi, setEklendi] = useState(false);
  return (
    <button
      onClick={() => {
        sepeteEkle(slug, urunAdi);
        setEklendi(true);
        setTimeout(() => setEklendi(false), 1500);
      }}
      className="mt-3 w-full rounded-xl border-2 py-2 text-sm font-semibold transition"
      style={eklendi ? { borderColor: renk, background: renk, color: "#fff" } : { borderColor: renk, color: renk }}
    >
      {eklendi ? "✓ Sepete eklendi" : "Sepete Ekle"}
    </button>
  );
}

export function SepetRozeti({ slug, renk }: { slug: string; renk: string }) {
  const sepet = useSepet(slug);
  const adet = sepet.reduce((t, k) => t + k.adet, 0);
  return (
    <a href={`/m/${slug}/sepet`} className="relative flex flex-col items-center hover:opacity-70">
      <span className="text-lg">🛒</span>Sepetim
      {adet > 0 && (
        <span
          className="absolute -right-2 -top-1 grid h-4 min-w-4 place-items-center rounded-full px-1 text-[10px] font-bold text-white"
          style={{ background: renk }}
        >
          {adet}
        </span>
      )}
    </a>
  );
}
