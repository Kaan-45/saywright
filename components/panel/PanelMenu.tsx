// ─────────────────────────────────────────────────────────────
// PanelMenu.tsx — Üye panelinin üst menüsü
// Sekmeler, "+ Yeni site" butonu ve profil açılır menüsü.
// ─────────────────────────────────────────────────────────────
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Logo from "@/components/Logo";
import { CikisButonu, YeniSiteButonu } from "@/components/PanelButonlari";
import { basHarfler } from "@/lib/yardimci";

const SEKMELER = [
  { href: "/panel", ad: "Genel bakış", ikon: "🏠" },
  { href: "/panel/projeler", ad: "Projelerim", ikon: "🗂️" },
  { href: "/panel/uyelik", ad: "Üyeliğim", ikon: "💎" },
  { href: "/panel/profil", ad: "Profilim", ikon: "👤" },
];

export default function PanelMenu({
  ad,
  eposta,
  planAdi,
  hakVar,
  admin,
}: {
  ad: string;
  eposta: string;
  planAdi: string;
  hakVar: boolean;
  admin: boolean; // Saywright yöneticisi mi? (sadece onlara "Saywright Admin" linki görünür)
}) {
  const yol = usePathname();
  const [acik, setAcik] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Açılır menünün dışına tıklanınca kapansın
  useEffect(() => {
    if (!acik) return;
    const kapat = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setAcik(false);
    };
    document.addEventListener("mousedown", kapat);
    return () => document.removeEventListener("mousedown", kapat);
  }, [acik]);

  const aktifMi = (href: string) => (href === "/panel" ? yol === "/panel" : yol.startsWith(href));

  return (
    <header className="sticky top-0 z-40 border-b border-cizgi bg-kart/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-3 sm:px-6">
        <Logo />
        <nav className="hidden items-center gap-1 md:flex">
          {SEKMELER.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className={`rounded-lg px-3 py-2 text-sm transition ${
                aktifMi(s.href) ? "bg-nane font-semibold text-gece" : "text-derin hover:bg-nane/50 hover:text-gece"
              }`}
            >
              {s.ad}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          {admin && (
            <Link href="/admin" className="hidden rounded-full bg-gece px-2.5 py-1 text-xs font-semibold text-nane hover:bg-derin sm:inline">
              🛡️ Saywright Admin
            </Link>
          )}
          <span className="hidden rounded-full border border-deniz/40 px-2.5 py-1 text-xs font-semibold text-derin sm:inline">
            💎 {planAdi}
          </span>
          <YeniSiteButonu hakVar={hakVar} kucuk />

          {/* Profil açılır menüsü */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setAcik(!acik)}
              className="grid h-9 w-9 place-items-center rounded-full bg-derin text-sm font-bold text-nane ring-2 ring-transparent transition hover:ring-deniz"
              aria-label="Profil menüsü"
              aria-expanded={acik}
            >
              {basHarfler(ad)}
            </button>
            {acik && (
              <div className="absolute right-0 mt-2 w-64 overflow-hidden rounded-2xl border border-cizgi bg-kart shadow-xl shadow-gece/10">
                <div className="border-b border-cizgi px-4 py-3">
                  <p className="font-semibold">{ad}</p>
                  <p className="truncate text-xs text-derin/70">{eposta}</p>
                </div>
                <div className="p-1.5 text-sm">
                  {SEKMELER.map((s) => (
                    <Link
                      key={s.href}
                      href={s.href}
                      onClick={() => setAcik(false)}
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-derin hover:bg-nane/50 hover:text-gece"
                    >
                      <span>{s.ikon}</span>
                      {s.ad}
                    </Link>
                  ))}
                  {admin && (
                    <Link
                      href="/admin"
                      onClick={() => setAcik(false)}
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2 font-semibold text-gece hover:bg-nane/50"
                    >
                      <span>🛡️</span>
                      Saywright Admin
                    </Link>
                  )}
                  <Link
                    href="/#sss"
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-derin hover:bg-nane/50 hover:text-gece"
                  >
                    <span>❓</span>
                    Yardım
                  </Link>
                </div>
                <div className="border-t border-cizgi p-1.5">
                  <CikisButonu className="w-full rounded-lg px-3 py-2 text-left text-sm text-rose-700 hover:bg-rose-50" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobilde sekmeler alt satırda, yana kaydırılabilir */}
      <nav className="flex gap-1 overflow-x-auto px-4 pb-2 md:hidden">
        {SEKMELER.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className={`shrink-0 rounded-lg px-3 py-1.5 text-sm ${aktifMi(s.href) ? "bg-nane font-semibold" : "text-derin"}`}
          >
            {s.ikon} {s.ad}
          </Link>
        ))}
      </nav>
    </header>
  );
}
