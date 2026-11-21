// ─────────────────────────────────────────────────────────────
// UrunlerSekmesi.tsx — Ürün listesi, ürün ekleme/düzenleme formu ve silme onayı
// ─────────────────────────────────────────────────────────────
"use client";

import { useState } from "react";
import { UrunKarti } from "@/templates/magaza/MagazaSablonu";
import type { MagazaAyarlari, Urun } from "@/templates/magaza/tipler";
import { Alan, girdiSinifi, Pencere, StokRozeti, tl, type KaydetFn } from "./ortak";

const HAZIR_EMOJILER = ["🛍️", "👕", "👟", "👜", "💍", "🧴", "☕", "📚", "🎧", "⌚", "🕯️", "🧸", "🍫", "🌿", "🏺", "🎁"];
const HAZIR_ROZETLER = ["", "Yeni", "Çok Satan", "Fırsat", "Sınırlı Sayıda", "El Yapımı"];

// Form kutuları her zaman metin tutar; kaydederken sayıya çeviriyoruz.
type Taslak = { ad: string; aciklama: string; fiyat: string; eskiFiyat: string; stok: string; rozet: string; emoji: string };

const bosTaslak: Taslak = { ad: "", aciklama: "", fiyat: "", eskiFiyat: "", stok: "", rozet: "", emoji: "🛍️" };

function urundenTaslak(u: Urun): Taslak {
  return {
    ad: u.ad,
    aciklama: u.aciklama,
    fiyat: String(u.fiyat),
    eskiFiyat: u.eskiFiyat === undefined ? "" : String(u.eskiFiyat),
    stok: u.stok === undefined ? "" : String(u.stok),
    rozet: u.rozet ?? "",
    emoji: u.emoji,
  };
}

const sayi = (s: string) => Number(s.replace(",", "."));

/** Taslağı kontrol edip ürüne çevirir. Hata varsa mesajı döner. */
function taslaktanUrun(t: Taslak, digerAdlar: string[]): Urun | string {
  const ad = t.ad.trim();
  if (!ad) return "Ürün adını yaz.";
  if (digerAdlar.some((a) => a.toLocaleLowerCase("tr") === ad.toLocaleLowerCase("tr"))) return "Bu adda bir ürün zaten var.";
  const fiyat = sayi(t.fiyat);
  if (t.fiyat.trim() === "" || !(fiyat >= 0)) return "Geçerli bir fiyat yaz.";
  let eskiFiyat: number | undefined;
  if (t.eskiFiyat.trim()) {
    eskiFiyat = sayi(t.eskiFiyat);
    if (!(eskiFiyat > fiyat)) return "İndirimden önceki fiyat, satış fiyatından büyük olmalı.";
  }
  let stok: number | undefined;
  if (t.stok.trim()) {
    stok = sayi(t.stok);
    if (!Number.isInteger(stok) || stok < 0) return "Stok 0 veya daha büyük bir tam sayı olmalı.";
  }
  return {
    ad,
    aciklama: t.aciklama.trim(),
    fiyat,
    eskiFiyat,
    stok,
    rozet: t.rozet.trim() || undefined,
    emoji: t.emoji.trim() || "🛍️",
  };
}

export default function UrunlerSekmesi({
  ayarlar,
  kaydet,
  formuAc,
  setFormuAc,
}: {
  ayarlar: MagazaAyarlari;
  kaydet: KaydetFn;
  formuAc: boolean; // Genel Bakış'taki "Ürün ekle" butonu formu açabilsin diye
  setFormuAc: (a: boolean) => void;
}) {
  const [arama, setArama] = useState("");
  const [duzenlenen, setDuzenlenen] = useState<number | null>(null); // null = yeni ürün
  const [taslak, setTaslak] = useState<Taslak>(bosTaslak);
  const [hata, setHata] = useState("");
  const [bekliyor, setBekliyor] = useState(false);
  const [silinecek, setSilinecek] = useState<number | null>(null);

  const liste = ayarlar.urunler
    .map((u, i) => ({ u, i }))
    .filter(({ u }) => u.ad.toLocaleLowerCase("tr").includes(arama.toLocaleLowerCase("tr")));

  function yeniUrun() {
    setDuzenlenen(null);
    setTaslak(bosTaslak);
    setHata("");
    setFormuAc(true);
  }

  function duzenle(i: number) {
    setDuzenlenen(i);
    setTaslak(urundenTaslak(ayarlar.urunler[i]));
    setHata("");
    setFormuAc(true);
  }

  async function formuKaydet(e: React.FormEvent) {
    e.preventDefault();
    const digerAdlar = ayarlar.urunler.filter((_, i) => i !== duzenlenen).map((u) => u.ad);
    const sonuc = taslaktanUrun(taslak, digerAdlar);
    if (typeof sonuc === "string") return setHata(sonuc);

    const urunler =
      duzenlenen === null ? [sonuc, ...ayarlar.urunler] : ayarlar.urunler.map((u, i) => (i === duzenlenen ? sonuc : u));
    setBekliyor(true);
    const sunucuHatasi = await kaydet({ ...ayarlar, urunler });
    setBekliyor(false);
    if (sunucuHatasi) return setHata(sunucuHatasi);
    setFormuAc(false);
  }

  async function sil() {
    if (silinecek === null) return;
    setBekliyor(true);
    await kaydet({ ...ayarlar, urunler: ayarlar.urunler.filter((_, i) => i !== silinecek) });
    setBekliyor(false);
    setSilinecek(null);
  }

  // Formdaki taslağın canlı önizlemesi (geçersizse en azından adı ve emojiyi göster)
  const onizlemeUrun = (() => {
    const s = taslaktanUrun(taslak, []);
    return typeof s === "string"
      ? { ad: taslak.ad || "Ürün adı", aciklama: taslak.aciklama, fiyat: sayi(taslak.fiyat) || 0, emoji: taslak.emoji || "🛍️" }
      : s;
  })();

  const yaz = (alan: keyof Taslak) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setTaslak({ ...taslak, [alan]: e.target.value });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Ürünler</h1>
          <p className="text-sm text-derin/70">{ayarlar.urunler.length} ürün · Değişiklikler sitende anında görünür.</p>
        </div>
        <button onClick={yeniUrun} className="rounded-xl bg-gece px-4 py-2.5 text-sm font-semibold text-white hover:bg-derin">
          + Ürün ekle
        </button>
      </div>

      <input
        value={arama}
        onChange={(e) => setArama(e.target.value)}
        placeholder="🔍  Ürün ara…"
        className={`${girdiSinifi} mt-6 max-w-sm`}
      />

      <div className="mt-4 overflow-x-auto rounded-2xl border border-cizgi bg-kart">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-cizgi text-left text-xs uppercase tracking-wider text-derin/60">
              <th className="p-4 font-semibold">Ürün</th>
              <th className="p-4 font-semibold">Fiyat</th>
              <th className="p-4 font-semibold">Stok</th>
              <th className="p-4 font-semibold">Rozet</th>
              <th className="p-4 text-right font-semibold">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {liste.map(({ u, i }) => (
              <tr key={`${i}-${u.ad}`} className="border-b border-cizgi/60 last:border-0 hover:bg-white/60">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-2xl" style={{ background: ayarlar.renk.acik }}>
                      {u.emoji}
                    </span>
                    <div>
                      <p className="font-semibold">{u.ad}</p>
                      <p className="line-clamp-1 text-xs text-derin/60">{u.aciklama || "—"}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <p className="font-semibold">{tl(u.fiyat)}</p>
                  {u.eskiFiyat !== undefined && (
                    <p className="text-xs text-derin/50">
                      <span className="line-through">{tl(u.eskiFiyat)}</span>{" "}
                      <span className="font-semibold text-rose-600">%{Math.round((1 - u.fiyat / u.eskiFiyat) * 100)}</span>
                    </p>
                  )}
                </td>
                <td className="p-4">
                  <StokRozeti stok={u.stok} />
                </td>
                <td className="whitespace-nowrap p-4 text-derin/80">{u.rozet ?? "—"}</td>
                <td className="p-4">
                  <div className="flex justify-end gap-1">
                    <button onClick={() => duzenle(i)} className="whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold text-derin hover:bg-nane">
                      ✏️ Düzenle
                    </button>
                    <button
                      onClick={() => setSilinecek(i)}
                      className="whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50"
                    >
                      🗑️ Sil
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {liste.length === 0 && (
              <tr>
                <td colSpan={5} className="p-10 text-center text-derin/60">
                  {arama ? "Aramana uygun ürün bulunamadı." : "Henüz ürün yok. “+ Ürün ekle” ile başla."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Ürün ekleme / düzenleme formu ── */}
      {formuAc && (
        <Pencere baslik={duzenlenen === null ? "Yeni ürün ekle" : "Ürünü düzenle"} kapat={() => setFormuAc(false)}>
          <form onSubmit={formuKaydet} className="grid gap-6 p-5 md:grid-cols-[1fr_220px]">
            <div className="space-y-4">
              <Alan etiket="Görsel (emoji)">
                <div className="flex flex-wrap items-center gap-1.5">
                  <input value={taslak.emoji} onChange={yaz("emoji")} className={`${girdiSinifi} w-16 text-center text-xl`} maxLength={4} />
                  {HAZIR_EMOJILER.map((e) => (
                    <button
                      type="button"
                      key={e}
                      onClick={() => setTaslak({ ...taslak, emoji: e })}
                      className={`grid h-9 w-9 place-items-center rounded-lg text-lg hover:bg-nane ${taslak.emoji === e ? "bg-nane ring-2 ring-deniz" : ""}`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </Alan>
              <Alan etiket="Ürün adı *">
                <input value={taslak.ad} onChange={yaz("ad")} maxLength={80} required className={girdiSinifi} placeholder="Örn: Lavanta Kokulu Mum" />
              </Alan>
              <Alan etiket="Kısa açıklama">
                <input value={taslak.aciklama} onChange={yaz("aciklama")} maxLength={120} className={girdiSinifi} placeholder="Örn: Soya mumu, 40 saat yanma süresi" />
              </Alan>
              <div className="grid gap-4 sm:grid-cols-2">
                <Alan etiket="Satış fiyatı (₺) *">
                  <input value={taslak.fiyat} onChange={yaz("fiyat")} inputMode="decimal" required className={girdiSinifi} placeholder="289" />
                </Alan>
                <Alan etiket="İndirimden önceki fiyat (₺)" ipucu="Boş bırakırsan indirim gösterilmez.">
                  <input value={taslak.eskiFiyat} onChange={yaz("eskiFiyat")} inputMode="decimal" className={girdiSinifi} placeholder="399" />
                </Alan>
                <Alan etiket="Stok adedi" ipucu="Boş = stok takibi yok · 0 = Tükendi">
                  <input value={taslak.stok} onChange={yaz("stok")} inputMode="numeric" className={girdiSinifi} placeholder="25" />
                </Alan>
                <Alan etiket="Rozet">
                  <select value={taslak.rozet} onChange={yaz("rozet")} className={girdiSinifi}>
                    {HAZIR_ROZETLER.concat(HAZIR_ROZETLER.includes(taslak.rozet) ? [] : [taslak.rozet]).map((r) => (
                      <option key={r} value={r}>
                        {r || "Rozet yok"}
                      </option>
                    ))}
                  </select>
                </Alan>
              </div>
              {hata && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{hata}</p>}
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setFormuAc(false)} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-derin hover:bg-zemin">
                  Vazgeç
                </button>
                <button disabled={bekliyor} className="rounded-xl bg-gece px-5 py-2.5 text-sm font-semibold text-white hover:bg-derin disabled:opacity-50">
                  {bekliyor ? "Kaydediliyor…" : duzenlenen === null ? "Ürünü ekle" : "Değişiklikleri kaydet"}
                </button>
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-derin/60">Sitende böyle görünecek</p>
              <div className="@container pointer-events-none">
                <UrunKarti urun={onizlemeUrun} ayarlar={ayarlar} />
              </div>
            </div>
          </form>
        </Pencere>
      )}

      {/* ── Silme onayı ── */}
      {silinecek !== null && (
        <Pencere baslik="Ürünü sil" kapat={() => setSilinecek(null)}>
          <div className="p-6">
            <p>
              <strong>{ayarlar.urunler[silinecek]?.ad}</strong> sitenden kaldırılacak. Bu işlem geri alınamaz.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setSilinecek(null)} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-derin hover:bg-zemin">
                Vazgeç
              </button>
              <button
                onClick={sil}
                disabled={bekliyor}
                className="rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-50"
              >
                {bekliyor ? "Siliniyor…" : "Evet, sil"}
              </button>
            </div>
          </div>
        </Pencere>
      )}
    </div>
  );
}
