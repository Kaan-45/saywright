// Geliştirme sırasında paketler arasında geçiş yapmayı sağlayan araç (yayında görünmez)
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function GelistiriciPlanSecici({ mevcut, planlar }: { mevcut: string; planlar: { kod: string; ad: string }[] }) {
  const router = useRouter();
  const [bekleyen, setBekleyen] = useState<string | null>(null);
  const [hata, setHata] = useState("");

  async function sec(kod: string) {
    setBekleyen(kod);
    setHata("");
    const y = await fetch("/api/gelistirici/plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan: kod }),
    });
    setBekleyen(null);
    if (!y.ok) return setHata((await y.json().catch(() => ({}))).hata ?? "Değiştirilemedi.");
    router.refresh(); // sayfa yeni paketle yeniden çizilsin (menüdeki rozet dahil)
  }

  return (
    <section className="mt-8 rounded-3xl border-2 border-dashed border-amber-400 bg-amber-50 p-6">
      <p className="text-xs font-bold uppercase tracking-widest text-amber-700">🧪 Geliştirici aracı · sadece senin bilgisayarında</p>
      <h2 className="mt-1 text-lg font-bold text-gece">Paketleri dene</h2>
      <p className="mt-1 text-sm text-derin">
        Ödeme sistemi bağlanana kadar paketler arasında buradan geçiş yapabilirsin. Site yayına alındığında bu kutu
        görünmez ve çalışmaz.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {planlar.map((p) => (
          <button
            key={p.kod}
            onClick={() => sec(p.kod)}
            disabled={p.kod === mevcut || bekleyen !== null}
            className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
              p.kod === mevcut ? "bg-gece text-white" : "border border-amber-300 bg-white text-gece hover:bg-amber-100"
            } disabled:cursor-default`}
          >
            {bekleyen === p.kod ? "Geçiliyor…" : p.kod === mevcut ? `✓ ${p.ad} (şu an)` : `${p.ad} paketine geç`}
          </button>
        ))}
      </div>
      {hata && <p className="mt-3 text-sm text-rose-700">{hata}</p>}
    </section>
  );
}
