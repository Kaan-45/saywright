// ─────────────────────────────────────────────────────────────
// YonetimPaneli.tsx — Site sahibinin admin paneli (Pro paket özelliği)
//
// Solda menü, sağda seçili sekme:
//   📊 Genel bakış   📦 Ürünler   🎨 Mağaza ayarları   🧾 Siparişler (yakında)
// Her değişiklik sunucuya kaydedilir (PUT /api/siteler/[id]).
// ─────────────────────────────────────────────────────────────
"use client";

import Link from "next/link";
import { useState } from "react";
import MagazaSablonu from "@/templates/magaza/MagazaSablonu";
import { ayardanSema } from "@/templates/magaza/sema";
import type { MagazaAyarlari } from "@/templates/magaza/tipler";
import type { Musteri } from "@/lib/musteriler";
import AyarlarSekmesi from "./AyarlarSekmesi";
import { Pencere, StokRozeti } from "./ortak";
import MusterilerSekmesi from "./MusterilerSekmesi";
import SiparislerSekmesi from "./SiparislerSekmesi";
import type { Siparis } from "@/lib/siparis";
import UrunlerSekmesi from "./UrunlerSekmesi";
import YayinKarti, { type YayinDurumu } from "./YayinKarti";

type Sekme = "genel" | "urunler" | "ayarlar" | "musteriler" | "siparisler";

const SEKMELER: { kod: Sekme; ad: string; ikon: string }[] = [
  { kod: "genel", ad: "Genel bakış", ikon: "📊" },
  { kod: "urunler", ad: "Ürünler", ikon: "📦" },
  { kod: "ayarlar", ad: "Mağaza ayarları", ikon: "🎨" },
  { kod: "musteriler", ad: "Müşteriler", ikon: "👥" },
  { kod: "siparisler", ad: "Siparişler", ikon: "🧾" },
];

type Durum = { tur: "bos" } | { tur: "kaydediliyor" } | { tur: "kaydedildi" } | { tur: "hata"; mesaj: string };

export default function YonetimPaneli({
  siteId,
  ilkAyarlar,
  ilkSurum,
  gelistirmeModu,
  ilkYayin,
  musteriler,
  ilkSiparisler,
}: {
  siteId: string;
  ilkAyarlar: MagazaAyarlari;
  ilkSurum: number;
  gelistirmeModu: boolean;
  ilkYayin: YayinDurumu;
  musteriler: Musteri[];
  ilkSiparisler: Siparis[];
}) {
  const [ayarlar, setAyarlar] = useState(ilkAyarlar);
  const [surum, setSurum] = useState(ilkSurum); // her kayıtta sunucudan gelen yeni sürümü tutarız
  const [sekme, setSekme] = useState<Sekme>("genel");
  const [durum, setDurum] = useState<Durum>({ tur: "bos" });
  const [onizleme, setOnizleme] = useState(false);
  const [urunFormuAcik, setUrunFormuAcik] = useState(false);
  const [yayin, setYayin] = useState(ilkYayin);

  // Tüm sekmeler değişiklikleri bu fonksiyonla kaydeder.
  async function kaydet(yeni: MagazaAyarlari): Promise<string | null> {
    setDurum({ tur: "kaydediliyor" });
    try {
      const yanit = await fetch(`/api/siteler/${siteId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ayarlar: ayardanSema(yeni), surum }),
      });
      const sonuc = await yanit.json();
      if (!yanit.ok) {
        setDurum({ tur: "hata", mesaj: sonuc.hata });
        return sonuc.hata ?? "Kaydedilemedi.";
      }
      setAyarlar(sonuc.ayarlar);
      setSurum(sonuc.surum);
      setDurum({ tur: "kaydedildi" });
      return null;
    } catch {
      setDurum({ tur: "hata", mesaj: "Sunucuya ulaşılamadı." });
      return "Sunucuya ulaşılamadı.";
    }
  }

  const urunler = ayarlar.urunler;
  const tukenen = urunler.filter((u) => u.stok === 0);
  const azKalan = urunler.filter((u) => u.stok !== undefined && u.stok > 0 && u.stok <= 5);
  const indirimli = urunler.filter((u) => u.eskiFiyat !== undefined);
  const [siparisler, setSiparisler] = useState(ilkSiparisler);
  const yeniSiparis = siparisler.filter((s) => s.durum === "yeni").length;
  const bekleyen = siparisler.filter((s) => s.durum === "yeni" || s.durum === "hazirlaniyor").length;

  return (
    <div className="flex min-h-screen flex-col bg-zemin text-gece md:flex-row">
      {/* ── Sol menü ── */}
      <aside className="shrink-0 bg-gece text-white md:sticky md:top-0 md:flex md:h-screen md:w-64 md:flex-col">
        <div className="border-b border-white/10 px-5 py-5">
          <p className="text-xs uppercase tracking-widest text-nane/80">Admin paneli</p>
          <p className="mt-1 truncate text-lg font-bold">{ayarlar.magazaAdi}</p>
        </div>
        <nav className="flex gap-1 overflow-x-auto p-3 md:flex-1 md:flex-col">
          {SEKMELER.map((s) => (
            <button
              key={s.kod}
              onClick={() => setSekme(s.kod)}
              className={`flex shrink-0 items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-sm transition ${
                sekme === s.kod ? "bg-white/10 font-semibold text-white" : "text-white/70 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span>{s.ikon}</span>
              {s.ad}
              {s.kod === "siparisler" && yeniSiparis > 0 && (
                <span className="ml-auto rounded bg-sky-400 px-1.5 py-0.5 text-[10px] font-bold text-gece">{yeniSiparis} yeni</span>
              )}
              {s.kod === "musteriler" && musteriler.length > 0 && (
                <span className="ml-auto rounded bg-nane px-1.5 py-0.5 text-[10px] font-bold text-gece">{musteriler.length}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="hidden space-y-1 border-t border-white/10 p-3 text-sm md:block">
          <button onClick={() => setOnizleme(true)} className="w-full rounded-xl px-3.5 py-2.5 text-left text-white/70 hover:bg-white/5 hover:text-white">
            👁️ Siteyi önizle
          </button>
          <Link href={`/olustur/${siteId}`} className="block rounded-xl px-3.5 py-2.5 text-white/70 hover:bg-white/5 hover:text-white">
            💬 Sohbetle düzenle
          </Link>
          {yayin.yayinda && yayin.slug && (
            <a
              href={`/m/${yayin.slug}`}
              target="_blank"
              rel="noreferrer"
              className="block rounded-xl px-3.5 py-2.5 text-nane hover:bg-white/5"
            >
              🌐 Canlı siteyi aç ↗
            </a>
          )}
          <Link href="/panel" className="block rounded-xl px-3.5 py-2.5 text-white/70 hover:bg-white/5 hover:text-white">
            ← Panelime dön
          </Link>
        </div>
      </aside>

      {/* ── Sağ içerik ── */}
      {/* min-w-0: geniş tablolar sayfayı yana taşırmasın, kendi içinde kaysın */}
      <main className="min-w-0 flex-1 px-4 py-6 sm:px-8 sm:py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          {gelistirmeModu ? (
            <p className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">
              🧪 Geliştirme modu: Pro özelliği test için açık
            </p>
          ) : (
            <span />
          )}
          <div className="flex items-center gap-3 text-sm">
            {durum.tur === "kaydediliyor" && <span className="text-derin/70">⏳ Kaydediliyor…</span>}
            {durum.tur === "kaydedildi" && <span className="text-deniz">✓ Kaydedildi</span>}
            {durum.tur === "hata" && <span className="text-rose-700">⚠️ {durum.mesaj}</span>}
            <button onClick={() => setOnizleme(true)} className="rounded-xl border border-cizgi bg-kart px-3.5 py-2 font-semibold hover:bg-white md:hidden">
              👁️ Önizle
            </button>
          </div>
        </div>

        {sekme === "genel" && (
          <div>
            <h1 className="text-2xl font-bold">Hoş geldin 👋</h1>
            <p className="text-sm text-derin/70">Mağazanın kısa özeti.</p>

            <div className="mt-6 grid grid-cols-2 gap-4 xl:grid-cols-4">
              {[
                ["Toplam ürün", String(urunler.length), "📦"],
                ["Bekleyen sipariş", String(bekleyen), "🧾"],
                ["İndirimdeki ürün", String(indirimli.length), "🏷️"],
                ["Tükenen ürün", String(tukenen.length), "⚠️"],
              ].map(([etiket, deger, ikon]) => (
                <div key={etiket} className="rounded-2xl border border-cizgi bg-kart p-5">
                  <p className="flex items-center justify-between text-sm text-derin/70">
                    {etiket} <span>{ikon}</span>
                  </p>
                  <p className="mt-2 text-2xl font-extrabold">{deger}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_380px]">
              <div className="space-y-6">
                <div className="rounded-2xl border border-cizgi bg-kart p-5">
                  <h2 className="font-semibold">Hızlı işlemler</h2>
                  <div className="mt-4 grid gap-3 xl:grid-cols-3">
                    <button
                      onClick={() => {
                        setSekme("urunler");
                        setUrunFormuAcik(true);
                      }}
                      className="flex items-center gap-3 rounded-xl bg-gece p-4 text-left text-white hover:bg-derin xl:flex-col xl:items-start"
                    >
                      <span className="text-xl">➕</span>
                      <p className="text-sm font-semibold xl:mt-2">Ürün ekle</p>
                    </button>
                    <button onClick={() => setSekme("ayarlar")} className="flex items-center gap-3 rounded-xl border border-cizgi bg-white/60 p-4 text-left hover:bg-nane/40 xl:flex-col xl:items-start">
                      <span className="text-xl">🎨</span>
                      <p className="text-sm font-semibold xl:mt-2">Görünümü değiştir</p>
                    </button>
                    <Link href={`/olustur/${siteId}`} className="flex items-center gap-3 rounded-xl border border-cizgi bg-white/60 p-4 hover:bg-nane/40 xl:flex-col xl:items-start">
                      <span className="text-xl">💬</span>
                      <p className="text-sm font-semibold xl:mt-2">Yapay zekaya sor</p>
                    </Link>
                  </div>
                </div>

                <div className="rounded-2xl border border-cizgi bg-kart p-5">
                  <h2 className="font-semibold">Stok uyarıları</h2>
                  {tukenen.length + azKalan.length === 0 ? (
                    <p className="mt-3 text-sm text-derin/70">Her şey yolunda, stok sorunu yok. ✅</p>
                  ) : (
                    <ul className="mt-3 divide-y divide-cizgi/70">
                      {[...tukenen, ...azKalan].map((u) => (
                        <li key={u.ad} className="flex items-center justify-between py-2.5 text-sm">
                          <span>
                            {u.emoji} {u.ad}
                          </span>
                          <StokRozeti stok={u.stok} />
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <YayinKarti siteId={siteId} durum={yayin} setDurum={setYayin} />
              </div>

              <div>
                <div className="pointer-events-none h-80 overflow-hidden rounded-2xl border border-cizgi bg-white">
                  <div style={{ width: "250%", transform: "scale(0.4)", transformOrigin: "top left" }}>
                    <MagazaSablonu ayarlar={ayarlar} />
                  </div>
                </div>
                <button onClick={() => setOnizleme(true)} className="mt-3 w-full rounded-xl bg-gece py-2.5 text-sm font-semibold text-white hover:bg-derin">
                  👁️ Siteyi tam boyut önizle
                </button>
              </div>
            </div>
          </div>
        )}

        {sekme === "urunler" && (
          <UrunlerSekmesi ayarlar={ayarlar} kaydet={kaydet} formuAc={urunFormuAcik} setFormuAc={setUrunFormuAcik} />
        )}

        {sekme === "ayarlar" && <AyarlarSekmesi ayarlar={ayarlar} kaydet={kaydet} />}

        {sekme === "musteriler" && <MusterilerSekmesi musteriler={musteriler} yayinda={yayin.yayinda} />}

        {sekme === "siparisler" && (
          <SiparislerSekmesi
            siteId={siteId}
            siparisler={siparisler}
            setSiparisler={setSiparisler}
            stokYenilendi={(a, s) => {
              setAyarlar(a);
              setSurum(s);
            }}
          />
        )}
      </main>

      {onizleme && (
        <Pencere baslik={`${ayarlar.magazaAdi} · önizleme`} kapat={() => setOnizleme(false)} genis>
          <MagazaSablonu ayarlar={ayarlar} />
        </Pencere>
      )}
    </div>
  );
}
