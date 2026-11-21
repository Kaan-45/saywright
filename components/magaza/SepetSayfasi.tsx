// ─────────────────────────────────────────────────────────────
// SepetSayfasi.tsx — /m/[adres]/sepet sayfasının içeriği (tarayıcıda çalışır)
// Sepetteki ürünleri mağazanın GÜNCEL ürün listesiyle eşleştirir:
// fiyat değişmişse yenisi, ürün kalkmışsa uyarı gösterilir.
// ─────────────────────────────────────────────────────────────
"use client";

import Link from "next/link";
import { sepetiYaz } from "@/lib/sepetIstemci";
import { MAKS_ADET, UCRETSIZ_KARGO_ESIGI_KURUS, kurus, tlYaz, tutarlariHesapla } from "@/lib/siparis";
import type { Urun } from "@/templates/magaza/tipler";
import { useSepet } from "./SepetBilesenleri";

export function sepetSatirlari(sepet: { ad: string; adet: number }[], urunler: Urun[]) {
  return sepet.map((k) => {
    const urun = urunler.find((u) => u.ad === k.ad);
    const sorun = !urun
      ? "Bu ürün artık satışta değil"
      : urun.stok === 0
        ? "Tükendi"
        : urun.stok !== undefined && urun.stok < k.adet
          ? `Stokta yalnızca ${urun.stok} adet var`
          : null;
    return { ...k, urun, sorun, birimKurus: urun ? kurus(urun.fiyat) : 0 };
  });
}

export default function SepetSayfasi({ slug, urunler, renk, girisli }: { slug: string; urunler: Urun[]; renk: { ana: string; acik: string }; girisli: boolean }) {
  const sepet = useSepet(slug);
  const satirlar = sepetSatirlari(sepet, urunler);
  const gecerli = satirlar.filter((s) => s.urun && !s.sorun);
  const t = tutarlariHesapla(gecerli);
  const kalanKargo = UCRETSIZ_KARGO_ESIGI_KURUS - t.araToplam;

  const adetDegistir = (ad: string, adet: number) =>
    sepetiYaz(slug, sepet.map((k) => (k.ad === ad ? { ...k, adet: Math.max(0, Math.min(MAKS_ADET, adet)) } : k)));

  if (sepet.length === 0)
    return (
      <div className="rounded-3xl bg-white p-12 text-center shadow-sm ring-1 ring-black/5">
        <p className="text-5xl">🛒</p>
        <h1 className="mt-4 text-2xl font-bold">Sepetin boş</h1>
        <p className="mt-1 text-zinc-500">Beğendiğin ürünleri sepete ekleyerek başlayabilirsin.</p>
        <Link href={`/m/${slug}#urunler`} className="mt-6 inline-block rounded-xl px-6 py-3 text-sm font-bold text-white" style={{ background: renk.ana }}>
          Alışverişe başla
        </Link>
      </div>
    );

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_300px]">
      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5">
        <h1 className="text-2xl font-bold">Sepetim <span className="text-base font-normal text-zinc-400">({sepet.length} ürün)</span></h1>
        <ul className="mt-6 divide-y divide-zinc-100">
          {satirlar.map((s) => (
            <li key={s.ad} className="flex items-center gap-4 py-4">
              <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl text-3xl" style={{ background: renk.acik }}>
                {s.urun?.emoji ?? "❔"}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{s.ad}</p>
                {s.sorun ? (
                  <p className="text-xs font-semibold text-red-600">⚠️ {s.sorun}</p>
                ) : (
                  <p className="text-sm text-zinc-500">{tlYaz(s.birimKurus)}</p>
                )}
              </div>
              {s.urun && (
                <div className="flex items-center rounded-xl border border-zinc-200">
                  <button onClick={() => adetDegistir(s.ad, s.adet - 1)} className="px-3 py-1.5 text-lg" aria-label="Azalt">
                    −
                  </button>
                  <span className="w-8 text-center text-sm font-semibold">{s.adet}</span>
                  <button onClick={() => adetDegistir(s.ad, s.adet + 1)} className="px-3 py-1.5 text-lg" aria-label="Artır">
                    +
                  </button>
                </div>
              )}
              <p className="w-24 text-right font-bold">{s.urun && !s.sorun ? tlYaz(s.birimKurus * s.adet) : "—"}</p>
              <button onClick={() => adetDegistir(s.ad, 0)} className="text-zinc-400 hover:text-red-600" aria-label="Sepetten çıkar">
                ✕
              </button>
            </li>
          ))}
        </ul>
      </section>

      <aside className="h-fit space-y-4 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5 md:sticky md:top-6">
        <h2 className="font-bold">Sipariş özeti</h2>
        <div className="space-y-2 text-sm">
          <p className="flex justify-between"><span className="text-zinc-500">Ara toplam</span>{tlYaz(t.araToplam)}</p>
          <p className="flex justify-between"><span className="text-zinc-500">Kargo</span>{t.kargo === 0 ? <span className="font-semibold text-emerald-600">Bedava</span> : tlYaz(t.kargo)}</p>
          <p className="flex justify-between border-t border-zinc-100 pt-2 text-base font-bold"><span>Toplam</span><span style={{ color: renk.ana }}>{tlYaz(t.toplam)}</span></p>
        </div>
        {kalanKargo > 0 && t.araToplam > 0 && (
          <p className="rounded-xl p-3 text-xs" style={{ background: renk.acik }}>
            🚚 {tlYaz(kalanKargo)} daha ekle, <strong>kargo bedava</strong> olsun!
          </p>
        )}
        <Link
          href={girisli ? `/m/${slug}/odeme` : `/m/${slug}/giris?devam=odeme`}
          aria-disabled={gecerli.length === 0}
          className={`block rounded-xl py-3 text-center text-sm font-bold text-white ${gecerli.length === 0 ? "pointer-events-none opacity-40" : "hover:opacity-90"}`}
          style={{ background: renk.ana }}
        >
          {girisli ? "Siparişi tamamla →" : "Giriş yap ve devam et →"}
        </Link>
        {satirlar.some((s) => s.sorun) && <p className="text-xs text-red-600">Uyarılı ürünler siparişe eklenmez; sepetten çıkarabilirsin.</p>}
      </aside>
    </div>
  );
}
