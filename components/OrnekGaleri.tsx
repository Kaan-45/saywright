// ─────────────────────────────────────────────────────────────
// OrnekGaleri.tsx — Tıklanabilir örnek site galerisi
//
// Kartlara tıklayınca sayfanın üstünde bir pencere (modal) açılır.
// Pencere tüm ekranı kaplamaz; içinde örnek site gerçek boyutunda
// ve kaydırılabilir şekilde görünür.
// Kapatmak için: ✕ butonu, pencere dışına tıklamak veya Esc tuşu.
// Örnekler arasında ← → ok tuşlarıyla da gezilebilir.
// ─────────────────────────────────────────────────────────────
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ORNEK_SITELER } from "./ornekSiteler";
import { MiniOnizleme, SiteGoster } from "./SiteOnizleme";

export default function OrnekGaleri() {
  const [secili, setSecili] = useState<number | null>(null);
  const toplam = ORNEK_SITELER.length;

  useEffect(() => {
    if (secili === null) return;
    const tus = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSecili(null);
      if (e.key === "ArrowRight") setSecili((s) => (s === null ? s : (s + 1) % toplam));
      if (e.key === "ArrowLeft") setSecili((s) => (s === null ? s : (s - 1 + toplam) % toplam));
    };
    window.addEventListener("keydown", tus);
    document.body.style.overflow = "hidden"; // arkadaki sayfa kaymasın
    return () => {
      window.removeEventListener("keydown", tus);
      document.body.style.overflow = "";
    };
  }, [secili, toplam]);

  const site = secili === null ? null : ORNEK_SITELER[secili];

  return (
    <>
      <div className="mt-14 grid gap-6 md:grid-cols-3">
        {ORNEK_SITELER.map((o, i) => (
          // Kart <button> olamaz: içindeki örnek sitede de butonlar var (buton içinde buton geçersiz HTML).
          // Bu yüzden tıklanabilir bir <div> kullanıp klavyeyle de açılabilmesini sağlıyoruz.
          <div
            key={o.adres}
            role="button"
            tabIndex={0}
            onClick={() => setSecili(i)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setSecili(i);
              }
            }}
            className="group cursor-pointer overflow-hidden rounded-2xl border border-cizgi bg-white text-left shadow-sm transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-gece/15"
          >
            <div className="relative">
              <div className="flex items-center gap-1.5 border-b border-zinc-100 bg-zinc-50 px-3 py-2">
                <span className="h-2 w-2 rounded-full bg-red-400" />
                <span className="h-2 w-2 rounded-full bg-yellow-400" />
                <span className="h-2 w-2 rounded-full bg-green-400" />
                <span className="ml-2 text-[10px] text-zinc-400">{o.adres}</span>
              </div>
              <MiniOnizleme site={o} />
              <div className="absolute inset-0 grid place-items-center bg-gece/0 transition group-hover:bg-gece/40">
                <span className="translate-y-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold opacity-0 shadow-xl transition group-hover:translate-y-0 group-hover:opacity-100">
                  🔍 Büyüt ve incele
                </span>
              </div>
            </div>
            <div className="border-t border-cizgi bg-kart p-5">
              <span className="rounded-full bg-nane px-2.5 py-1 text-xs font-semibold text-derin">{o.etiket}</span>
              <p className="mt-3 text-sm leading-relaxed text-derin">“{o.istek}”</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Büyük önizleme penceresi ── */}
      {site && secili !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-gece/70 p-3 backdrop-blur-sm sm:p-6"
          onClick={() => setSecili(null)}
          role="dialog"
          aria-modal="true"
          aria-label={`${site.etiket} örneği`}
        >
          <div
            className="flex h-[88vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()} // pencerenin içine tıklayınca kapanmasın
          >
            <div className="flex items-center gap-3 border-b border-zinc-200 bg-zinc-50 px-4 py-3">
              <div className="flex gap-1.5">
                <span className="h-3 w-3 rounded-full bg-red-400" />
                <span className="h-3 w-3 rounded-full bg-yellow-400" />
                <span className="h-3 w-3 rounded-full bg-green-400" />
              </div>
              <span className="hidden flex-1 truncate rounded-lg bg-white px-3 py-1 text-xs text-zinc-500 ring-1 ring-zinc-200 sm:block">
                🔒 {site.adres}
              </span>
              <div className="ml-auto flex items-center gap-1">
                <button
                  onClick={() => setSecili((secili - 1 + toplam) % toplam)}
                  className="rounded-lg px-3 py-1.5 text-sm text-zinc-600 hover:bg-zinc-200"
                  aria-label="Önceki örnek"
                >
                  ←
                </button>
                <span className="text-xs text-zinc-400">
                  {secili + 1} / {toplam}
                </span>
                <button
                  onClick={() => setSecili((secili + 1) % toplam)}
                  className="rounded-lg px-3 py-1.5 text-sm text-zinc-600 hover:bg-zinc-200"
                  aria-label="Sonraki örnek"
                >
                  →
                </button>
                <button
                  onClick={() => setSecili(null)}
                  className="ml-2 grid h-8 w-8 place-items-center rounded-full bg-zinc-200 text-zinc-700 hover:bg-zinc-300"
                  aria-label="Kapat"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* key: örnek değişince kaydırma en başa dönsün */}
            <div key={secili} className="flex-1 overflow-y-auto">
              <SiteGoster site={site} />
            </div>

            <div className="flex flex-col items-center justify-between gap-3 border-t border-zinc-200 bg-white px-5 py-3 sm:flex-row">
              <p className="text-sm text-zinc-500">
                Örnek istek: <span className="text-zinc-800">“{site.istek}”</span>
              </p>
              <Link
                href="/kayit"
                className="shrink-0 rounded-xl bg-gece px-5 py-2.5 text-sm font-semibold text-white hover:bg-derin"
              >
                Benimkini oluştur →
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
