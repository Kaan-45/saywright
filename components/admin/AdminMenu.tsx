// Süper admin panelinin sol menüsü
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const SEKMELER = [
  { href: "/admin", ad: "Genel bakış", ikon: "📊" },
  { href: "/admin/talepler", ad: "Yayın talepleri", ikon: "📥" },
  { href: "/admin/kullanicilar", ad: "Kullanıcılar", ikon: "👥" },
  { href: "/admin/siteler", ad: "Siteler", ikon: "🏪" },
];

export default function AdminMenu({ ad, bekleyenTalep }: { ad: string; bekleyenTalep: number }) {
  const yol = usePathname();
  const aktif = (href: string) => (href === "/admin" ? yol === "/admin" : yol.startsWith(href));
  return (
    <aside className="shrink-0 bg-gece text-white md:sticky md:top-0 md:flex md:h-screen md:w-64 md:flex-col">
      <div className="border-b border-white/10 px-5 py-5">
        <p className="text-xs uppercase tracking-widest text-nane/80">🛡️ Saywright Admin</p>
        <p className="mt-1 truncate text-lg font-bold">{ad}</p>
      </div>
      <nav className="flex gap-1 overflow-x-auto p-3 md:flex-1 md:flex-col">
        {SEKMELER.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className={`flex shrink-0 items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm transition ${
              aktif(s.href) ? "bg-white/10 font-semibold text-white" : "text-white/70 hover:bg-white/5 hover:text-white"
            }`}
          >
            <span>{s.ikon}</span>
            {s.ad}
            {s.href === "/admin/talepler" && bekleyenTalep > 0 && (
              <span className="ml-auto rounded bg-amber-400 px-1.5 py-0.5 text-[10px] font-bold text-gece">{bekleyenTalep}</span>
            )}
          </Link>
        ))}
      </nav>
      <div className="hidden border-t border-white/10 p-3 text-sm md:block">
        <Link href="/panel" className="block rounded-xl px-3.5 py-2.5 text-white/70 hover:bg-white/5 hover:text-white">
          ← Kendi panelime dön
        </Link>
      </div>
    </aside>
  );
}
