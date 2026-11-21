// ─────────────────────────────────────────────────────────────
// RestoranSablonu.tsx — Şık bir restoran sitesi şablonu
//
// Koyu, zarif bir karşılama alanı, imza tabaklar, menü,
// şefin sözü, rezervasyon formu ve alt bilgi.
// ─────────────────────────────────────────────────────────────

import type { RestoranAyarlari } from "./tipler";

const tl = (n: number) => n.toLocaleString("tr-TR") + " ₺";

export default function RestoranSablonu({ ayarlar }: { ayarlar: RestoranAyarlari }) {
  const { renk } = ayarlar;
  const kapak = ayarlar.imzaYemekler[0]?.emoji ?? "🍽️";

  return (
    <div className="@container min-h-full text-stone-900" style={{ background: renk.acik }}>
      {/* ── Karşılama ── */}
      <section className="relative overflow-hidden text-white" style={{ background: renk.koyu }}>
        <div
          className="absolute -right-32 -top-32 h-[520px] w-[520px] rounded-full opacity-30 blur-3xl"
          style={{ background: renk.ana }}
        />
        <nav className="relative mx-auto flex max-w-6xl items-center justify-between px-6 py-6 @3xl:px-10">
          <span className="font-serif text-2xl tracking-wide">{ayarlar.ad}</span>
          <div className="hidden gap-8 text-sm text-white/70 @3xl:flex">
            <span>Menü</span>
            <span>Hakkımızda</span>
            <span>Galeri</span>
            <span>İletişim</span>
          </div>
          <span className="rounded-full border border-white/30 px-4 py-2 text-xs font-semibold">Rezervasyon</span>
        </nav>

        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-6 pb-24 pt-10 @3xl:grid-cols-2 @3xl:px-10 @3xl:pt-16">
          <div>
            <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: renk.ana }}>
              <span className="h-px w-8" style={{ background: renk.ana }} />
              {ayarlar.mutfak}
            </p>
            <h1 className="mt-5 font-serif text-4xl leading-tight @3xl:text-6xl">{ayarlar.slogan}</h1>
            <p className="mt-5 max-w-md text-white/70">{ayarlar.hakkimizda}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <span className="rounded-full px-6 py-3 text-sm font-semibold text-white" style={{ background: renk.ana }}>
                Masa Ayırt
              </span>
              <span className="rounded-full border border-white/30 px-6 py-3 text-sm font-semibold">Menüyü İncele</span>
            </div>
          </div>

          <div className="relative mx-auto grid aspect-square w-full max-w-sm place-items-center">
            <div
              className="absolute inset-0 rounded-full"
              style={{ background: `radial-gradient(circle at 35% 30%, ${renk.ana}55, transparent 65%), #ffffff0d` }}
            />
            <div className="absolute inset-8 rounded-full border border-white/10" />
            <span className="relative text-[150px] drop-shadow-[0_30px_40px_rgba(0,0,0,0.5)]">{kapak}</span>
            <div className="absolute -left-2 top-10 rounded-2xl bg-white px-4 py-3 text-stone-900 shadow-2xl">
              <p className="text-lg font-bold">4.9 <span className="text-amber-500">★</span></p>
              <p className="text-[11px] text-stone-500">1.200+ misafir yorumu</p>
            </div>
            <div className="absolute -right-2 bottom-10 rounded-2xl bg-white px-4 py-3 text-stone-900 shadow-2xl">
              <p className="text-sm font-bold">🟢 Bugün açık</p>
              <p className="text-[11px] text-stone-500">{ayarlar.saatler}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Bilgi kartı ── */}
      <section className="relative mx-auto -mt-10 max-w-5xl px-6">
        <div className="grid gap-px overflow-hidden rounded-3xl bg-stone-200 shadow-xl @3xl:grid-cols-3">
          {[
            ["🕐", "Çalışma saatleri", ayarlar.saatler],
            ["📍", "Adres", ayarlar.adres],
            ["📞", "Rezervasyon", ayarlar.telefon],
          ].map(([ikon, baslik, deger]) => (
            <div key={baslik} className="flex items-center gap-4 bg-white p-6">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-lg" style={{ background: renk.acik }}>
                {ikon}
              </span>
              <div>
                <p className="text-xs uppercase tracking-wider text-stone-400">{baslik}</p>
                <p className="text-sm font-semibold">{deger}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── İmza tabaklar ── */}
      <section className="mx-auto max-w-6xl px-6 py-20 @3xl:px-10">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: renk.ana }}>
          Şefin seçkisi
        </p>
        <h2 className="mt-3 text-center font-serif text-4xl">İmza Tabaklarımız</h2>
        <div className="mt-12 grid gap-6 @3xl:grid-cols-3">
          {ayarlar.imzaYemekler.map((y) => (
            <div key={y.ad} className="group overflow-hidden rounded-3xl bg-white shadow-sm transition hover:shadow-xl">
              <div
                className="relative grid h-56 place-items-center"
                style={{ background: `linear-gradient(150deg, ${renk.koyu}, ${renk.ana})` }}
              >
                <span className="text-8xl drop-shadow-2xl transition duration-500 group-hover:scale-110 group-hover:rotate-6">
                  {y.emoji}
                </span>
                {y.etiket && (
                  <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold">
                    {y.etiket}
                  </span>
                )}
              </div>
              <div className="p-6">
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="font-serif text-xl">{y.ad}</h3>
                  <span className="font-bold" style={{ color: renk.ana }}>
                    {tl(y.fiyat)}
                  </span>
                </div>
                <p className="mt-2 text-sm text-stone-500">{y.aciklama}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Menü ── */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-6xl px-6 @3xl:px-10">
          <h2 className="text-center font-serif text-4xl">Menü</h2>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {ayarlar.menu.map((m, i) => (
              <span
                key={m.kategori}
                className="rounded-full px-4 py-1.5 text-sm font-medium"
                style={i === 0 ? { background: renk.koyu, color: "#fff" } : { background: renk.acik }}
              >
                {m.kategori}
              </span>
            ))}
          </div>
          <div className="mt-12 grid gap-x-16 gap-y-12 @3xl:grid-cols-2">
            {ayarlar.menu.map((m) => (
              <div key={m.kategori}>
                <h3 className="font-serif text-2xl" style={{ color: renk.ana }}>
                  {m.kategori}
                </h3>
                <div className="mt-5 space-y-5">
                  {m.yemekler.map((y) => (
                    <div key={y.ad}>
                      <div className="flex items-baseline gap-3">
                        <span className="font-semibold">
                          {y.emoji} {y.ad}
                        </span>
                        <span className="flex-1 border-b border-dotted border-stone-300" />
                        <span className="font-semibold">{tl(y.fiyat)}</span>
                      </div>
                      <p className="mt-1 text-sm text-stone-500">{y.aciklama}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Şefin sözü ── */}
      <section className="mx-auto max-w-3xl px-6 py-20 text-center">
        <span className="font-serif text-7xl leading-none" style={{ color: renk.ana }}>
          “
        </span>
        <p className="-mt-4 font-serif text-2xl italic leading-relaxed @3xl:text-3xl">{ayarlar.sefSozu}</p>
        <p className="mt-6 text-sm font-semibold uppercase tracking-widest text-stone-500">— {ayarlar.sefAdi}, Şef</p>
      </section>

      {/* ── Rezervasyon ── */}
      <section className="px-6 pb-20">
        <div
          className="mx-auto grid max-w-5xl overflow-hidden rounded-3xl text-white @3xl:grid-cols-2"
          style={{ background: renk.koyu }}
        >
          <div className="p-8 @3xl:p-12">
            <h2 className="font-serif text-3xl">Masanızı ayırtın</h2>
            <p className="mt-3 text-sm text-white/60">Özel günleriniz için bize önceden haber verin, sofranızı birlikte hazırlayalım.</p>
            <div className="mt-8 space-y-3 text-sm text-white/80">
              <p>📍 {ayarlar.adres}</p>
              <p>📞 {ayarlar.telefon}</p>
              <p>🕐 {ayarlar.saatler}</p>
            </div>
          </div>
          <div className="space-y-3 bg-white/5 p-8 @3xl:p-12">
            {["Ad Soyad", "Telefon", "Tarih ve saat", "Kişi sayısı"].map((alan) => (
              <div key={alan} className="rounded-xl border border-white/15 px-4 py-3 text-sm text-white/50">
                {alan}
              </div>
            ))}
            <div className="rounded-xl py-3 text-center text-sm font-semibold" style={{ background: renk.ana }}>
              Rezervasyon Yap
            </div>
          </div>
        </div>
      </section>

      <footer className="px-6 py-10 text-center text-sm text-white/50" style={{ background: renk.koyu }}>
        <p className="font-serif text-2xl text-white">{ayarlar.ad}</p>
        <p className="mt-2">{ayarlar.mutfak} · {ayarlar.adres}</p>
        <p className="mt-4 text-xs">© {ayarlar.ad}. Afiyet olsun.</p>
      </footer>
    </div>
  );
}
