// ─────────────────────────────────────────────────────────────
// SiparislerSekmesi.tsx — Admin panelinde gelen siparişler
// Duruma göre süzme, sipariş detayını açma ve durumu ilerletme:
//   Yeni → Hazırlanıyor → Kargoda (takip no) → Teslim edildi   (ya da İptal)
// ─────────────────────────────────────────────────────────────
"use client";

import { useState } from "react";
import SiparisDetayi, { DurumRozeti } from "@/components/SiparisDetayi";
import { DURUMLAR, SONRAKI_DURUMLAR, tlYaz, type Siparis, type SiparisDurumu } from "@/lib/siparis";
import type { MagazaAyarlari } from "@/templates/magaza/tipler";
import { girdiSinifi } from "./ortak";

const SUZGECLER: { kod: "tumu" | "acik" | SiparisDurumu; ad: string }[] = [
  { kod: "acik", ad: "Bekleyenler" },
  { kod: "tumu", ad: "Tümü" },
  { kod: "kargoda", ad: "Kargoda" },
  { kod: "teslim", ad: "Teslim edildi" },
  { kod: "iptal", ad: "İptal" },
];
const acikMi = (d: SiparisDurumu) => d === "yeni" || d === "hazirlaniyor";

const BUTON_YAZISI: Record<SiparisDurumu, string> = {
  yeni: "",
  hazirlaniyor: "📦 Hazırlamaya başla",
  kargoda: "🚚 Kargoya verildi",
  teslim: "✅ Teslim edildi",
  iptal: "İptal et",
};

export default function SiparislerSekmesi({
  siteId,
  siparisler,
  setSiparisler,
  stokYenilendi,
}: {
  siteId: string;
  siparisler: Siparis[];
  setSiparisler: (s: Siparis[]) => void;
  stokYenilendi: (ayarlar: MagazaAyarlari, surum: number) => void; // iptalde stoklar geri gelir
}) {
  const [suzgec, setSuzgec] = useState<(typeof SUZGECLER)[number]["kod"]>("acik");
  const [acik, setAcik] = useState<string | null>(null);
  const [takip, setTakip] = useState("");
  const [bekliyor, setBekliyor] = useState(false);
  const [hata, setHata] = useState("");

  const liste = siparisler.filter((s) => (suzgec === "tumu" ? true : suzgec === "acik" ? acikMi(s.durum) : s.durum === suzgec));
  const sayi = (k: (typeof SUZGECLER)[number]["kod"]) =>
    siparisler.filter((s) => (k === "tumu" ? true : k === "acik" ? acikMi(s.durum) : s.durum === k)).length;

  async function yenile() {
    setBekliyor(true);
    const y = await fetch(`/api/siteler/${siteId}/siparisler`);
    if (y.ok) setSiparisler((await y.json()).siparisler);
    setBekliyor(false);
  }

  async function durumDegistir(s: Siparis, durum: SiparisDurumu) {
    if (durum === "iptal" && !confirm(`${s.kod} numaralı sipariş iptal edilsin mi? Ürünlerin stokları geri eklenecek.`)) return;
    setBekliyor(true);
    setHata("");
    const y = await fetch(`/api/siteler/${siteId}/siparisler/${s.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ durum, kargoTakip: durum === "kargoda" ? takip : undefined }),
    });
    const sonuc = await y.json().catch(() => ({}));
    setBekliyor(false);
    if (!y.ok) return setHata(sonuc.hata ?? "Güncellenemedi.");
    setSiparisler(siparisler.map((x) => (x.id === s.id ? sonuc.siparis : x)));
    if (sonuc.ayarlar && sonuc.surum !== null) stokYenilendi(sonuc.ayarlar, sonuc.surum);
    setTakip("");
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Siparişler</h1>
          <p className="text-sm text-derin/70">Müşterilerinin verdiği siparişler. Durumu güncelledikçe müşterin de “Hesabım” sayfasında görür.</p>
        </div>
        <button onClick={yenile} disabled={bekliyor} className="rounded-xl border border-cizgi bg-kart px-4 py-2 text-sm font-semibold hover:bg-white disabled:opacity-50">
          ↻ Yenile
        </button>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {SUZGECLER.map((f) => (
          <button
            key={f.kod}
            onClick={() => setSuzgec(f.kod)}
            className={`rounded-full px-4 py-1.5 text-sm ${suzgec === f.kod ? "bg-gece font-semibold text-white" : "border border-cizgi bg-kart text-derin hover:bg-nane/50"}`}
          >
            {f.ad} <span className="opacity-60">({sayi(f.kod)})</span>
          </button>
        ))}
      </div>
      {hata && <p className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{hata}</p>}

      {liste.length === 0 ? (
        <div className="mt-6 rounded-2xl border-2 border-dashed border-cizgi bg-kart p-12 text-center">
          <p className="text-4xl">🧾</p>
          <p className="mt-3 font-semibold">{siparisler.length === 0 ? "Henüz sipariş yok" : "Bu bölümde sipariş yok"}</p>
          <p className="mt-1 text-sm text-derin/70">
            {siparisler.length === 0 ? "Siten yayındayken müşterilerin sipariş verdiğinde burada görünecek." : "Başka bir sekmeye göz at."}
          </p>
        </div>
      ) : (
        <ul className="mt-5 space-y-3">
          {liste.map((s) => {
            const acikmi = acik === s.id;
            return (
              <li key={s.id} className={`overflow-hidden rounded-2xl border bg-kart ${s.durum === "yeni" ? "border-deniz" : "border-cizgi"}`}>
                <button onClick={() => setAcik(acikmi ? null : s.id)} className="flex w-full flex-wrap items-center gap-x-4 gap-y-2 p-4 text-left hover:bg-white/50">
                  <span className="font-mono font-bold tracking-wider">{s.kod}</span>
                  <span className="text-sm text-derin">{s.teslimat.adSoyad}</span>
                  <span className="text-xs text-derin/60">{new Date(s.olusturma).toLocaleString("tr-TR", { dateStyle: "medium", timeStyle: "short" })}</span>
                  <span className="ml-auto font-bold">{tlYaz(s.toplamKurus)}</span>
                  <DurumRozeti durum={s.durum} />
                  <span className={`text-derin/50 transition ${acikmi ? "rotate-90" : ""}`}>›</span>
                </button>
                {acikmi && (
                  <div className="border-t border-cizgi bg-white p-5">
                    <SiparisDetayi siparis={s} />
                    <p className="mt-4 text-xs text-derin/60">
                      Müşteri e-postası:{" "}
                      <a href={`mailto:${s.eposta}`} className="text-deniz hover:underline">
                        {s.eposta}
                      </a>
                    </p>
                    {SONRAKI_DURUMLAR[s.durum].length > 0 && (
                      <div className="mt-5 flex flex-wrap items-end gap-2 border-t border-cizgi pt-4">
                        {SONRAKI_DURUMLAR[s.durum].includes("kargoda") && (
                          <input
                            value={takip}
                            onChange={(e) => setTakip(e.target.value)}
                            maxLength={60}
                            placeholder="Kargo takip no (isteğe bağlı)"
                            className={`${girdiSinifi} max-w-60`}
                          />
                        )}
                        {SONRAKI_DURUMLAR[s.durum].map((d) => (
                          <button
                            key={d}
                            onClick={() => durumDegistir(s, d)}
                            disabled={bekliyor}
                            className={`rounded-xl px-4 py-2.5 text-sm font-semibold disabled:opacity-40 ${
                              d === "iptal" ? "text-rose-700 hover:bg-rose-50" : "bg-gece text-white hover:bg-derin"
                            }`}
                          >
                            {BUTON_YAZISI[d]}
                          </button>
                        ))}
                      </div>
                    )}
                    {SONRAKI_DURUMLAR[s.durum].length === 0 && (
                      <p className="mt-4 text-sm text-derin/60">Bu sipariş {DURUMLAR[s.durum].ad.toLocaleLowerCase("tr")}; başka işlem yok.</p>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
