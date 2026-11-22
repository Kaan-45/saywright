// ─────────────────────────────────────────────────────────────
// HizliSecenekler.tsx — Sohbet ekranının altındaki "🎨 Hızlı seçenekler"
// Yazmadan, tıklayarak: mağaza türü, ana renk, arka plan, yazı rengi, bölümler.
// Her tık sunucuya gider (/api/siteler/[id]/secim), kaydedilir; mesaj hakkı harcamaz.
// ─────────────────────────────────────────────────────────────
"use client";

import { useState } from "react";
import { SECENEK_GRUPLARI, seciliMi, type SecenekGrubu } from "@/lib/demoSecenekleri";
import type { MagazaAyarlari } from "@/templates/magaza/tipler";

type Props = {
  siteId: string;
  ayarlar: MagazaAyarlari | null;
  acikBasla: boolean;
  onDegisti: (a: MagazaAyarlari) => void;
};

export default function HizliSecenekler({ siteId, ayarlar, acikBasla, onDegisti }: Props) {
  const [acik, setAcik] = useState(acikBasla);
  const [bekleyen, setBekleyen] = useState<string | null>(null); // tıklanan seçeneğin anahtarı
  const [bilgi, setBilgi] = useState<{ tur: "basari" | "hata"; metin: string } | null>(null);

  async function sec(grup: SecenekGrubu["kod"], kod: string) {
    if (bekleyen) return;
    setBekleyen(`${grup}:${kod}`);
    setBilgi(null);
    try {
      const yanit = await fetch(`/api/siteler/${siteId}/secim`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ grup, kod }),
      });
      const cevap = await yanit.json();
      if (!yanit.ok) return setBilgi({ tur: "hata", metin: "⚠️ " + cevap.hata });
      onDegisti(cevap.ayarlar);
      setBilgi({ tur: "basari", metin: "✓ " + cevap.mesaj });
    } catch {
      setBilgi({ tur: "hata", metin: "⚠️ Sunucuya ulaşılamadı." });
    } finally {
      setBekleyen(null);
    }
  }

  return (
    <div className="border-t border-zinc-200">
      <button
        type="button"
        onClick={() => setAcik(!acik)}
        aria-expanded={acik}
        className="flex w-full items-center justify-between px-4 py-2.5 text-sm font-semibold hover:bg-zemin"
      >
        <span>🎨 Hızlı seçenekler <span className="font-normal text-zinc-500">· mesaj harcamaz</span></span>
        <span className={`text-zinc-400 transition ${acik ? "rotate-180" : ""}`}>▾</span>
      </button>

      {acik && (
        <div className="max-h-36 space-y-3 overflow-y-auto px-4 pb-3 md:max-h-56">
          {SECENEK_GRUPLARI.map((g) => (
            <div key={g.kod}>
              <p className="mb-1.5 text-xs font-medium text-zinc-500">{g.baslik}</p>
              <div className="flex flex-wrap gap-1.5">
                {g.secenekler.map((s) => {
                  const secili = seciliMi(ayarlar, g.kod, s.kod);
                  const yukleniyor = bekleyen === `${g.kod}:${s.kod}`;
                  return (
                    <button
                      key={s.kod}
                      type="button"
                      onClick={() => sec(g.kod, s.kod)}
                      disabled={!!bekleyen}
                      aria-pressed={secili}
                      className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition disabled:cursor-wait ${
                        secili ? "border-derin bg-derin text-white" : "border-cizgi bg-white hover:border-deniz"
                      } ${yukleniyor ? "animate-pulse" : ""}`}
                    >
                      {s.renk && <span className="h-3.5 w-3.5 rounded-full ring-1 ring-black/15" style={{ background: s.renk }} />}
                      {s.emoji && <span>{s.emoji}</span>}
                      {s.etiket}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          {bilgi && (
            <p className={`text-xs ${bilgi.tur === "basari" ? "text-emerald-700" : "text-red-600"}`} role="status">
              {bilgi.metin}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
