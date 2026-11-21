// ─────────────────────────────────────────────────────────────
// Olusturucu.tsx — Site oluşturma ekranı
// Solda sohbet, sağda canlı önizleme. Her mesaj sunucuda kaydedilir,
// sayfa yenilense de site kaybolmaz.
// ─────────────────────────────────────────────────────────────
"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import MagazaSablonu from "@/templates/magaza/MagazaSablonu";
import type { MagazaAyarlari } from "@/templates/magaza/tipler";
import type { SohbetMesaji } from "@/lib/veritabani";

const ORNEKLER = [
  "El yapımı seramik kupalar satıyorum, adı Toprak Atölye olsun, doğal ve sade tonlar",
  "Spor ayakkabı mağazası istiyorum, enerjik turuncu renkler, SSS bölümü olsun",
  "Organik kuru meyve ve kuruyemiş satan bir site, yeşil tonlarda",
];

type Props = {
  siteId: string;
  ilkAyarlar: MagazaAyarlari | null;
  ilkMesajlar: SohbetMesaji[];
  ilkKalanMesaj: number;
  adminAcik: boolean;
  ilkIstek?: string; // panelden "hemen anlat" kutusuyla gelindiyse sohbet kutusu bununla dolu açılır
};

export default function Olusturucu({ siteId, ilkAyarlar, ilkMesajlar, ilkKalanMesaj, adminAcik, ilkIstek }: Props) {
  const [ayarlar, setAyarlar] = useState(ilkAyarlar);
  const [mesajlar, setMesajlar] = useState(ilkMesajlar);
  const [kalanMesaj, setKalanMesaj] = useState(ilkKalanMesaj);
  const [girdi, setGirdi] = useState(ilkIstek ?? "");
  const [bekliyor, setBekliyor] = useState(false);
  const sohbetSonu = useRef<HTMLDivElement>(null);

  // Yeni mesaj gelince sohbeti en alta kaydır
  useEffect(() => {
    sohbetSonu.current?.scrollIntoView({ behavior: "smooth" });
  }, [mesajlar, bekliyor]);

  async function gonder(metin: string) {
    if (!metin.trim() || bekliyor || kalanMesaj <= 0) return;
    setMesajlar((eski) => [...eski, { kimden: "musteri", metin }]);
    setGirdi("");
    setBekliyor(true);
    try {
      const yanit = await fetch("/api/sihirbaz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteId, metin }),
      });
      const cevap = await yanit.json();
      if (!yanit.ok) {
        // Başarısız mesaj kaydedilmedi; ekrandan da geri alıyoruz ki yazdığın kaybolmasın
        setMesajlar((eski) => [...eski.slice(0, -1)]);
        setGirdi(metin);
        setMesajlar((eski) => [...eski, { kimden: "sihirbaz", metin: "⚠️ " + cevap.hata }]);
        return;
      }
      setAyarlar(cevap.ayarlar);
      setKalanMesaj(cevap.kalanMesaj);
      setMesajlar((eski) => [...eski, { kimden: "sihirbaz", metin: cevap.mesaj }]);
    } catch {
      setMesajlar((eski) => [...eski, { kimden: "sihirbaz", metin: "⚠️ Sunucuya ulaşılamadı." }]);
    } finally {
      setBekliyor(false);
    }
  }

  return (
    <main className="flex h-screen flex-col bg-zemin text-gece md:flex-row">
      {/* ── Sol: sohbet ── */}
      <aside className="flex h-1/2 w-full shrink-0 flex-col border-cizgi bg-kart md:h-full md:w-[400px] md:border-r">
        <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4">
          <Link href="/panel" className="text-sm text-zinc-500 hover:text-zinc-900">
            ← Panelim
          </Link>
          {adminAcik && ayarlar && (
            <Link href={`/yonetim/${siteId}`} className="text-sm font-semibold text-derin hover:text-gece">
              ⚙️ Admin paneli
            </Link>
          )}
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              kalanMesaj > 3 ? "bg-nane text-derin" : "bg-amber-50 text-amber-700"
            }`}
          >
            {kalanMesaj} mesaj hakkı kaldı
          </span>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto p-5">
          {mesajlar.length === 0 && (
            <div>
              <p className="text-lg font-semibold">Nasıl bir site istiyorsun?</p>
              <p className="mt-1 text-sm text-zinc-500">
                Ne sattığını, mağazanın adını, sevdiğin renkleri yaz. İstersen bir örnekle başla:
              </p>
              <div className="mt-4 space-y-2">
                {ORNEKLER.map((ornek) => (
                  <button
                    key={ornek}
                    onClick={() => gonder(ornek)}
                    disabled={bekliyor}
                    className="w-full rounded-xl border border-cizgi bg-white/60 p-3 text-left text-sm transition hover:border-deniz hover:bg-nane/40"
                  >
                    {ornek}
                  </button>
                ))}
              </div>
            </div>
          )}
          {mesajlar.map((m, i) => (
            <div
              key={i}
              className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm ${
                m.kimden === "musteri"
                  ? "ml-auto rounded-br-md bg-derin text-white"
                  : "rounded-bl-md bg-white ring-1 ring-cizgi"
              }`}
            >
              {m.metin}
            </div>
          ))}
          {bekliyor && (
            <div className="w-fit animate-pulse rounded-2xl rounded-bl-md bg-white px-4 py-2.5 text-sm">
              Siten hazırlanıyor… ✨
            </div>
          )}
          <div ref={sohbetSonu} />
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            gonder(girdi);
          }}
          className="flex gap-2 border-t border-zinc-200 p-4"
        >
          <input
            value={girdi}
            onChange={(e) => setGirdi(e.target.value)}
            maxLength={1000}
            disabled={kalanMesaj <= 0}
            placeholder={kalanMesaj <= 0 ? "Bu site için mesaj hakkın doldu" : ayarlar ? "Değiştirmek istediğini yaz…" : "Siteni anlat…"}
            className="flex-1 rounded-xl border border-cizgi bg-white px-4 py-2.5 text-sm outline-none transition focus:border-deniz focus:ring-4 focus:ring-nane disabled:bg-zemin"
          />
          <button
            disabled={bekliyor || kalanMesaj <= 0}
            className="rounded-xl bg-gece px-4 text-sm font-semibold text-white transition hover:bg-derin disabled:opacity-40"
          >
            Gönder
          </button>
        </form>
      </aside>

      {/* ── Sağ: canlı önizleme ── */}
      <section className="flex-1 overflow-hidden p-3 md:p-6">
        <div className="flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-xl shadow-gece/10">
          <div className="flex items-center gap-1.5 border-b border-zinc-200 bg-zinc-50 px-4 py-2.5">
            <span className="h-3 w-3 rounded-full bg-red-400" />
            <span className="h-3 w-3 rounded-full bg-yellow-400" />
            <span className="h-3 w-3 rounded-full bg-green-400" />
            <span className="ml-3 rounded-md bg-white px-3 py-0.5 text-xs text-zinc-400 ring-1 ring-zinc-200">
              {ayarlar ? `${ayarlar.magazaAdi.toLocaleLowerCase("tr").replace(/\s+/g, "")}.com` : "siten-burada.com"}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto">
            {ayarlar ? (
              <MagazaSablonu ayarlar={ayarlar} />
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-center text-zinc-400">
                <p className="text-5xl">🪄</p>
                <p className="mt-3 text-sm">Siten burada belirecek</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
