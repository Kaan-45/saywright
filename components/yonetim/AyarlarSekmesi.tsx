// ─────────────────────────────────────────────────────────────
// AyarlarSekmesi.tsx — Mağaza adı, slogan, renkler, bölümler, kategoriler
// Değişiklikler önce sağdaki önizlemede görünür, "Kaydet" deyince sitene işlenir.
// ─────────────────────────────────────────────────────────────
"use client";

import { useState } from "react";
import MagazaSablonu from "@/templates/magaza/MagazaSablonu";
import type { MagazaAyarlari } from "@/templates/magaza/tipler";
import { RENKLER } from "@/templates/magaza/varsayilan";
import { Alan, girdiSinifi, type KaydetFn } from "./ortak";

const BOLUM_ADLARI: Record<keyof MagazaAyarlari["bolumler"], string> = {
  hakkimizda: "Hakkımızda",
  yorumlar: "Müşteri yorumları",
  sss: "Sıkça sorulan sorular",
  iletisim: "İletişim bilgileri",
};

export default function AyarlarSekmesi({ ayarlar, kaydet }: { ayarlar: MagazaAyarlari; kaydet: KaydetFn }) {
  const [taslak, setTaslak] = useState(ayarlar);
  const [yeniKategori, setYeniKategori] = useState("");
  const [hata, setHata] = useState("");
  const [bekliyor, setBekliyor] = useState(false);
  const degisti = JSON.stringify(taslak) !== JSON.stringify(ayarlar);
  const kategoriler = taslak.kategoriler ?? [];

  const degistir = (parca: Partial<MagazaAyarlari>) => setTaslak({ ...taslak, ...parca });

  function kategoriEkle() {
    const k = yeniKategori.trim();
    if (!k || kategoriler.includes(k)) return;
    degistir({ kategoriler: [...kategoriler, k] });
    setYeniKategori("");
  }

  async function kaydetTikla() {
    setHata("");
    setBekliyor(true);
    const h = await kaydet({ ...taslak, kampanya: taslak.kampanya?.trim() || undefined });
    setBekliyor(false);
    if (h) setHata(h);
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Mağaza ayarları</h1>
          <p className="text-sm text-derin/70">Sitenin adı, görünümü ve bölümleri.</p>
        </div>
        <div className="flex gap-2">
          <button
            disabled={!degisti || bekliyor}
            onClick={() => setTaslak(ayarlar)}
            className="rounded-xl px-4 py-2.5 text-sm font-semibold text-derin hover:bg-nane/50 disabled:opacity-40"
          >
            Vazgeç
          </button>
          <button
            disabled={!degisti || bekliyor}
            onClick={kaydetTikla}
            className="rounded-xl bg-gece px-5 py-2.5 text-sm font-semibold text-white hover:bg-derin disabled:opacity-40"
          >
            {bekliyor ? "Kaydediliyor…" : "Değişiklikleri kaydet"}
          </button>
        </div>
      </div>
      {hata && <p className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{hata}</p>}

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_420px]">
        <div className="space-y-6">
          {/* Genel */}
          <section className="space-y-4 rounded-2xl border border-cizgi bg-kart p-5">
            <h2 className="font-semibold">Genel bilgiler</h2>
            <Alan etiket="Mağaza adı">
              <input value={taslak.magazaAdi} onChange={(e) => degistir({ magazaAdi: e.target.value })} maxLength={60} className={girdiSinifi} />
            </Alan>
            <Alan etiket="Slogan" ipucu="Vitrindeki büyük başlık.">
              <input value={taslak.slogan} onChange={(e) => degistir({ slogan: e.target.value })} maxLength={120} className={girdiSinifi} />
            </Alan>
            <Alan etiket="Kampanya yazısı" ipucu="Vitrindeki küçük etiket. Örn: Seçili ürünlerde %20 indirim">
              <input value={taslak.kampanya ?? ""} onChange={(e) => degistir({ kampanya: e.target.value })} maxLength={80} className={girdiSinifi} />
            </Alan>
            <Alan etiket="Hakkımızda metni">
              <textarea
                value={taslak.hakkimizdaMetni}
                onChange={(e) => degistir({ hakkimizdaMetni: e.target.value })}
                rows={4}
                maxLength={600}
                className={girdiSinifi}
              />
            </Alan>
          </section>

          {/* Renkler */}
          <section className="space-y-4 rounded-2xl border border-cizgi bg-kart p-5">
            <h2 className="font-semibold">Renkler</h2>
            <div className="flex flex-wrap gap-2">
              {Object.values(RENKLER).map((r) => (
                <button
                  key={r.ad}
                  onClick={() => degistir({ renk: r })}
                  title={r.ad}
                  className={`h-9 w-9 rounded-full ring-offset-2 transition hover:scale-110 ${taslak.renk.ana === r.ana ? "ring-2 ring-gece" : ""}`}
                  style={{ background: `linear-gradient(135deg, ${r.ana} 50%, ${r.acik} 50%)` }}
                />
              ))}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {(["ana", "acik"] as const).map((alan) => (
                <Alan key={alan} etiket={alan === "ana" ? "Ana renk (butonlar, fiyatlar)" : "Açık renk (arka planlar)"}>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={taslak.renk[alan]}
                      onChange={(e) => degistir({ renk: { ...taslak.renk, ad: "özel", [alan]: e.target.value } })}
                      className="h-11 w-14 cursor-pointer rounded-lg border border-cizgi bg-white p-1"
                    />
                    <input
                      value={taslak.renk[alan]}
                      onChange={(e) => degistir({ renk: { ...taslak.renk, ad: "özel", [alan]: e.target.value } })}
                      maxLength={7}
                      className={`${girdiSinifi} font-mono`}
                    />
                  </div>
                </Alan>
              ))}
            </div>
          </section>

          {/* Bölümler */}
          <section className="rounded-2xl border border-cizgi bg-kart p-5">
            <h2 className="font-semibold">Sayfa bölümleri</h2>
            <div className="mt-3 divide-y divide-cizgi/70">
              {(Object.keys(BOLUM_ADLARI) as (keyof MagazaAyarlari["bolumler"])[]).map((b) => (
                <label key={b} className="flex cursor-pointer items-center justify-between py-3">
                  <span className="text-sm">{BOLUM_ADLARI[b]}</span>
                  <input
                    type="checkbox"
                    checked={taslak.bolumler[b]}
                    onChange={(e) => degistir({ bolumler: { ...taslak.bolumler, [b]: e.target.checked } })}
                    className="peer sr-only"
                  />
                  {/* Açma/kapama düğmesi görünümü */}
                  <span className="relative h-6 w-11 rounded-full bg-cizgi transition peer-checked:bg-deniz after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition peer-checked:after:translate-x-5" />
                </label>
              ))}
            </div>
          </section>

          {/* Kategoriler */}
          <section className="rounded-2xl border border-cizgi bg-kart p-5">
            <h2 className="font-semibold">Menüdeki kategoriler</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {kategoriler.map((k) => (
                <span key={k} className="flex items-center gap-1.5 rounded-full bg-nane py-1 pl-3 pr-1.5 text-sm text-derin">
                  {k}
                  <button
                    onClick={() => degistir({ kategoriler: kategoriler.filter((x) => x !== k) })}
                    className="grid h-5 w-5 place-items-center rounded-full text-xs hover:bg-white"
                    aria-label={`${k} kategorisini kaldır`}
                  >
                    ✕
                  </button>
                </span>
              ))}
              {kategoriler.length === 0 && <span className="text-sm text-derin/60">Varsayılan kategoriler gösteriliyor.</span>}
            </div>
            <div className="mt-3 flex gap-2">
              <input
                value={yeniKategori}
                onChange={(e) => setYeniKategori(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    kategoriEkle();
                  }
                }}
                maxLength={30}
                placeholder="Yeni kategori adı"
                className={girdiSinifi}
              />
              <button onClick={kategoriEkle} className="shrink-0 rounded-xl bg-nane px-4 text-sm font-semibold text-derin hover:bg-deniz hover:text-white">
                Ekle
              </button>
            </div>
          </section>
        </div>

        {/* Canlı önizleme */}
        <div className="xl:sticky xl:top-6 xl:self-start">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-derin/60">
            Canlı önizleme {degisti && <span className="text-deniz">· kaydedilmemiş değişiklikler</span>}
          </p>
          <div className="pointer-events-none h-[520px] overflow-hidden rounded-2xl border border-cizgi bg-white shadow-sm">
            <div style={{ width: "200%", transform: "scale(0.5)", transformOrigin: "top left" }}>
              <MagazaSablonu ayarlar={taslak} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
