// ─────────────────────────────────────────────────────────────
// MagazaSablonu.tsx — Modern alışveriş sitesi şablonu
//
// Ayarları alır, eksiksiz bir e-ticaret vitrini çizer:
// duyuru şeridi, arama çubuklu üst menü, kategori menüsü, kampanya
// vitrini, güven rozetleri, kategori daireleri, ürün kartları
// (indirim, puan, kargo etiketi), yorumlar, SSS, bülten ve alt bilgi.
//
// "@container" sayfaya değil, şablonun bulunduğu KUTUYA göre düzen
// kurar. Böylece küçük önizlemede de, büyük pencerede de doğru görünür.
// ─────────────────────────────────────────────────────────────

import { SepeteEkleButonu, SepetRozeti } from "@/components/magaza/SepetBilesenleri";
import type { MagazaAyarlari, Urun } from "./tipler";

const VARSAYILAN_KATEGORILER = ["Tüm Ürünler", "Yeni Gelenler", "Çok Satanlar", "İndirimdekiler", "Hediye Fikirleri"];

// Ürün adından her seferinde aynı çıkan "rastgele" bir sayı üretir
// (puan ve yorum sayısı her yenilemede değişmesin diye).
function sabitSayi(metin: string) {
  let h = 0;
  for (const c of metin) h = (h * 31 + c.charCodeAt(0)) | 0;
  return Math.abs(h);
}

const tl = (n: number) => n.toLocaleString("tr-TR") + " TL";

function Yildizlar({ puan }: { puan: number }) {
  return (
    <span className="text-amber-400" aria-label={`${puan} yıldız`}>
      {"★★★★★".slice(0, Math.round(puan))}
      <span className="text-zinc-300">{"★★★★★".slice(Math.round(puan))}</span>
    </span>
  );
}

export function UrunKarti({ urun, ayarlar, sepetSlug }: { urun: Urun; ayarlar: MagazaAyarlari; sepetSlug?: string }) {
  const { renk } = ayarlar;
  const tukendi = urun.stok === 0;
  const azKaldi = urun.stok !== undefined && urun.stok > 0 && urun.stok <= 5;
  const h = sabitSayi(urun.ad);
  const puan = 4 + (h % 10) / 10;
  const yorum = 24 + (h % 1900);
  const indirim = urun.eskiFiyat && urun.eskiFiyat > urun.fiyat ? Math.round((1 - urun.fiyat / urun.eskiFiyat) * 100) : 0;

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white transition hover:-translate-y-1 hover:shadow-xl hover:shadow-zinc-200/70">
      <div
        className="relative grid aspect-[4/5] place-items-center overflow-hidden"
        style={{ background: `linear-gradient(160deg, ${renk.acik} 0%, #ffffff 55%, ${renk.acik} 100%)` }}
      >
        <span
          className={`text-7xl drop-shadow-[0_12px_18px_rgba(0,0,0,0.18)] transition duration-300 group-hover:scale-110 ${
            tukendi ? "opacity-40 grayscale" : ""
          }`}
        >
          {urun.emoji}
        </span>
        {tukendi && (
          <span className="absolute inset-x-0 top-1/2 -translate-y-1/2 bg-zinc-900/80 py-1.5 text-center text-xs font-bold tracking-widest text-white">
            TÜKENDİ
          </span>
        )}
        <div className="absolute left-3 top-3 flex flex-col gap-1">
          {indirim > 0 && (
            <span className="rounded-md bg-rose-600 px-2 py-0.5 text-[11px] font-bold text-white">%{indirim}</span>
          )}
          {urun.rozet && (
            <span className="rounded-md bg-zinc-900 px-2 py-0.5 text-[11px] font-semibold text-white">{urun.rozet}</span>
          )}
        </div>
        <span className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-white text-zinc-400 shadow-sm">
          ♡
        </span>
        <span className="absolute bottom-3 left-3 rounded-md bg-emerald-600/95 px-2 py-0.5 text-[10px] font-semibold text-white">
          🚚 Kargo Bedava
        </span>
      </div>
      <div className="flex flex-1 flex-col p-3.5">
        <p className="text-sm leading-snug">
          <span className="font-bold">{ayarlar.magazaAdi}</span>{" "}
          <span className="text-zinc-600">{urun.ad}</span>
        </p>
        <p className="mt-0.5 line-clamp-1 text-xs text-zinc-400">{urun.aciklama}</p>
        <p className="mt-2 flex items-center gap-1 text-xs">
          <span className="font-semibold">{puan.toFixed(1)}</span>
          <Yildizlar puan={puan} />
          <span className="text-zinc-400">({yorum})</span>
        </p>
        {azKaldi && <p className="mt-1.5 text-xs font-semibold text-orange-600">🔥 Son {urun.stok} ürün!</p>}
        <div className="mt-auto pt-3">
          {indirim > 0 && <p className="text-xs text-zinc-400 line-through">{tl(urun.eskiFiyat!)}</p>}
          <p className="text-lg font-extrabold" style={{ color: renk.ana }}>
            {tl(urun.fiyat)}
          </p>
          {tukendi ? (
            <button disabled className="mt-3 w-full rounded-xl border-2 border-zinc-200 py-2 text-sm font-semibold text-zinc-400">
              Gelince Haber Ver
            </button>
          ) : sepetSlug ? (
            // Yayındaki mağazada gerçekten sepete ekleyen buton
            <SepeteEkleButonu slug={sepetSlug} urunAdi={urun.ad} renk={renk.ana} />
          ) : (
            <button
              className="mt-3 w-full rounded-xl border-2 py-2 text-sm font-semibold transition hover:bg-zinc-50"
              style={{ borderColor: renk.ana, color: renk.ana }}
            >
              Sepete Ekle
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MagazaSablonu({
  ayarlar,
  hesap,
  sepetSlug,
}: {
  ayarlar: MagazaAyarlari;
  hesap?: { href: string; etiket: string }; // sadece yayındaki mağazada verilir (önizlemelerde yok)
  sepetSlug?: string; // verilirse sepet gerçekten çalışır (yine sadece yayındaki mağazada)
}) {
  const { renk, urunler } = ayarlar;
  const kategoriler = ayarlar.kategoriler?.length ? ayarlar.kategoriler : VARSAYILAN_KATEGORILER;
  const kampanya = ayarlar.kampanya ?? "Seçili ürünlerde sepette %15 indirim";
  const emoji = (i: number) => urunler[i % Math.max(urunler.length, 1)]?.emoji ?? "🛍️";

  return (
    <div className="@container min-h-full" style={{ background: ayarlar.arkaPlan ?? "#ffffff", color: ayarlar.yaziRengi ?? "#18181b" }}>
      {/* ── Duyuru şeridi ── */}
      <div className="px-4 py-2 text-center text-xs font-medium text-white" style={{ background: renk.ana }}>
        🚚 500 TL üzeri siparişlerde kargo bedava · ↩️ 14 gün koşulsuz iade · 🔒 Güvenli ödeme
      </div>

      {/* ── Üst menü: logo, arama, hesap ── */}
      <header className="border-b border-zinc-100">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-4 @3xl:gap-8 @3xl:px-8">
          <span className="shrink-0 text-2xl font-black tracking-tight" style={{ color: renk.ana }}>
            {ayarlar.magazaAdi}
          </span>
          <div className="hidden flex-1 items-center gap-2 rounded-full bg-zinc-100 px-5 py-2.5 text-sm text-zinc-400 @2xl:flex">
            <span>🔍</span> Aradığın ürün, kategori veya markayı yaz
          </div>
          <div className="ml-auto flex items-center gap-5 text-xs text-zinc-600 @2xl:ml-0">
            {hesap ? (
              // Yayındaki mağazada: giriş yapmışsa "Merhaba, Ayşe" → Hesabım, yapmamışsa → Giriş
              <a href={hesap.href} className="flex flex-col items-center hover:opacity-70">
                <span className="text-lg">👤</span>
                <span className="max-w-20 truncate">{hesap.etiket}</span>
              </a>
            ) : (
              <span className="hidden flex-col items-center @lg:flex">
                <span className="text-lg">👤</span>Hesabım
              </span>
            )}
            <span className="hidden flex-col items-center @lg:flex">
              <span className="text-lg">♡</span>Favoriler
            </span>
            {sepetSlug ? (
              <SepetRozeti slug={sepetSlug} renk={renk.ana} />
            ) : (
              <span className="relative flex flex-col items-center">
                <span className="text-lg">🛒</span>Sepetim
                <span
                  className="absolute -right-2 -top-1 grid h-4 w-4 place-items-center rounded-full text-[10px] font-bold text-white"
                  style={{ background: renk.ana }}
                >
                  2
                </span>
              </span>
            )}
          </div>
        </div>
        <nav className="mx-auto flex max-w-7xl gap-6 overflow-x-auto px-4 pb-3 text-sm font-medium text-zinc-600 @3xl:px-8">
          {kategoriler.map((k, i) => (
            <span
              key={k}
              className="shrink-0 border-b-2 pb-1"
              style={i === 0 ? { borderColor: renk.ana, color: renk.ana } : { borderColor: "transparent" }}
            >
              {k}
            </span>
          ))}
        </nav>
      </header>

      <div className="mx-auto max-w-7xl px-4 @3xl:px-8">
        {/* ── Kampanya vitrini ── */}
        <section className="mt-6 grid gap-4 @3xl:grid-cols-3">
          <div
            className="relative overflow-hidden rounded-3xl p-8 text-white @3xl:col-span-2 @3xl:p-12"
            style={{ background: `linear-gradient(120deg, ${renk.ana} 0%, ${renk.ana}cc 60%, ${renk.ana}99 100%)` }}
          >
            <div className="absolute -right-10 -top-10 h-56 w-56 rounded-full bg-white/10" />
            <div className="absolute -bottom-16 right-24 h-40 w-40 rounded-full bg-white/10" />
            <span className="absolute right-8 top-1/2 hidden -translate-y-1/2 text-[120px] drop-shadow-2xl @2xl:block">
              {emoji(0)}
            </span>
            <span className="relative inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur">
              ⚡ {kampanya}
            </span>
            <h1 className="relative mt-4 max-w-md text-3xl font-black leading-tight @3xl:text-5xl">{ayarlar.slogan}</h1>
            <span className="relative mt-6 inline-block rounded-xl bg-white px-6 py-3 text-sm font-bold" style={{ color: renk.ana }}>
              Alışverişe Başla →
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4 @3xl:grid-cols-1">
            {[
              ["Yeni Sezon", "Haftanın yeni ürünleri", 1],
              ["Çok Satanlar", "En sevilenler burada", 2],
            ].map(([baslik, alt, i]) => (
              <div key={baslik as string} className="flex items-center justify-between rounded-3xl p-6" style={{ background: renk.acik }}>
                <div>
                  <p className="text-lg font-extrabold">{baslik}</p>
                  <p className="text-xs text-zinc-500">{alt}</p>
                  <p className="mt-3 text-xs font-bold" style={{ color: renk.ana }}>
                    Keşfet →
                  </p>
                </div>
                <span className="text-5xl drop-shadow-lg">{emoji(i as number)}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Güven rozetleri ── */}
        <section className="mt-6 grid grid-cols-2 gap-3 @3xl:grid-cols-4">
          {[
            ["🚀", "Hızlı Teslimat", "Aynı gün kargoda"],
            ["🔒", "Güvenli Ödeme", "256-bit SSL koruma"],
            ["↩️", "Kolay İade", "14 gün içinde ücretsiz"],
            ["💬", "7/24 Destek", "Her zaman yanındayız"],
          ].map(([ikon, baslik, alt]) => (
            <div key={baslik} className="flex items-center gap-3 rounded-2xl border border-zinc-100 p-4">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-lg" style={{ background: renk.acik }}>
                {ikon}
              </span>
              <div>
                <p className="text-sm font-bold">{baslik}</p>
                <p className="text-xs text-zinc-500">{alt}</p>
              </div>
            </div>
          ))}
        </section>

        {/* ── Kategori daireleri ── */}
        <section className="mt-10">
          <h2 className="text-xl font-extrabold">Kategoriler</h2>
          <div className="mt-4 flex gap-5 overflow-x-auto pb-2">
            {kategoriler.slice(0, 8).map((k, i) => (
              <div key={k} className="flex w-20 shrink-0 flex-col items-center gap-2 text-center">
                <span
                  className="grid h-20 w-20 place-items-center rounded-full text-3xl ring-2 ring-offset-2"
                  style={{ background: renk.acik, ["--tw-ring-color" as string]: renk.ana + "40" }}
                >
                  {emoji(i)}
                </span>
                <span className="text-xs font-medium leading-tight">{k}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Ürünler ── */}
        <section id="urunler" className="mt-10">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-xl font-extrabold">Çok Satanlar</h2>
              <p className="text-sm text-zinc-500">Bu hafta en çok tercih edilen ürünler</p>
            </div>
            <span className="text-sm font-semibold" style={{ color: renk.ana }}>
              Tümünü gör →
            </span>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-4 @2xl:grid-cols-3 @4xl:grid-cols-4">
            {urunler.map((u, i) => (
              <UrunKarti key={`${i}-${u.ad}`} urun={u} ayarlar={ayarlar} sepetSlug={sepetSlug} />
            ))}
          </div>
        </section>

        {/* ── Ara kampanya şeridi ── */}
        <section
          className="mt-12 flex flex-col items-start justify-between gap-4 rounded-3xl border-2 border-dashed p-6 @2xl:flex-row @2xl:items-center"
          style={{ borderColor: renk.ana + "55", background: renk.acik }}
        >
          <div>
            <p className="text-lg font-extrabold">İlk siparişine özel %10 indirim 🎁</p>
            <p className="text-sm text-zinc-600">Sepette bu kodu kullan, indirimi hemen gör.</p>
          </div>
          <span className="rounded-xl bg-white px-5 py-3 font-mono text-sm font-bold tracking-widest" style={{ color: renk.ana }}>
            HOSGELDIN10
          </span>
        </section>

        {ayarlar.bolumler.hakkimizda && (
          <section id="hakkimizda" className="mt-12 grid items-center gap-6 rounded-3xl bg-zinc-50 p-8 @3xl:grid-cols-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: renk.ana }}>
                Hikayemiz
              </p>
              <h2 className="mt-2 text-2xl font-extrabold">{ayarlar.magazaAdi} hakkında</h2>
              <p className="mt-3 leading-relaxed text-zinc-600">{ayarlar.hakkimizdaMetni}</p>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              {[
                ["10B+", "Mutlu müşteri"],
                ["4.8", "Ortalama puan"],
                ["24s", "Kargoya teslim"],
              ].map(([d, e]) => (
                <div key={e} className="rounded-2xl bg-white p-4 shadow-sm">
                  <p className="text-xl font-black" style={{ color: renk.ana }}>
                    {d}
                  </p>
                  <p className="text-xs text-zinc-500">{e}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {ayarlar.bolumler.yorumlar && (
          <section className="mt-12">
            <h2 className="text-xl font-extrabold">Müşterilerimiz ne diyor?</h2>
            <div className="mt-5 grid gap-4 @3xl:grid-cols-3">
              {[
                ["Ayşe K.", "Kargo ertesi gün geldi, paketleme çok özenliydi. Kesinlikle tekrar alacağım."],
                ["Mehmet T.", "Fiyat/performans olarak piyasadaki en iyisi. Ürün fotoğraftakinin aynısı."],
                ["Zeynep A.", "Müşteri hizmetleri çok ilgili, iade süreci de çok kolaydı."],
              ].map(([kisi, yorum]) => (
                <figure key={kisi} className="rounded-2xl border border-zinc-200 p-5">
                  <Yildizlar puan={5} />
                  <blockquote className="mt-2 text-sm leading-relaxed text-zinc-700">“{yorum}”</blockquote>
                  <figcaption className="mt-4 flex items-center gap-2 text-sm font-semibold">
                    <span className="grid h-8 w-8 place-items-center rounded-full text-xs text-white" style={{ background: renk.ana }}>
                      {kisi[0]}
                    </span>
                    {kisi} <span className="font-normal text-emerald-600">✓ Doğrulanmış alıcı</span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </section>
        )}

        {ayarlar.bolumler.sss && (
          <section className="mt-12">
            <h2 className="text-xl font-extrabold">Sıkça sorulan sorular</h2>
            <div className="mt-5 divide-y divide-zinc-200 rounded-2xl border border-zinc-200">
              {[
                ["Kargom ne zaman gelir?", "Siparişler aynı gün kargoya verilir, 1-3 iş günü içinde teslim edilir."],
                ["İade yapabilir miyim?", "14 gün içinde koşulsuz ve ücretsiz iade hakkınız vardır."],
                ["Hangi ödeme yöntemleri var?", "Kredi kartı, banka kartı, havale ve kapıda ödeme."],
              ].map(([soru, cevap]) => (
                <details key={soru} className="group p-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between font-semibold">
                    {soru}
                    <span className="text-xl transition group-open:rotate-45" style={{ color: renk.ana }}>
                      +
                    </span>
                  </summary>
                  <p className="mt-2 text-sm text-zinc-600">{cevap}</p>
                </details>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* ── Bülten ── */}
      <section className="mt-14 px-4 py-12 text-center text-white @3xl:px-8" style={{ background: renk.ana }}>
        <p className="text-2xl font-extrabold">Fırsatları ilk sen yakala</p>
        <p className="mt-1 text-sm text-white/80">Kampanya ve indirimlerden haberdar olmak için abone ol.</p>
        <div className="mx-auto mt-5 flex max-w-md gap-2 rounded-2xl bg-white p-1.5">
          <span className="flex-1 px-3 py-2 text-left text-sm text-zinc-400">E-posta adresin</span>
          <span className="rounded-xl bg-zinc-900 px-5 py-2 text-sm font-semibold">Abone ol</span>
        </div>
      </section>

      {/* ── Alt bilgi ── */}
      <footer id="iletisim" className="bg-zinc-950 px-4 py-10 text-sm text-zinc-400 @3xl:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 @2xl:grid-cols-4">
          <div>
            <p className="text-xl font-black text-white">{ayarlar.magazaAdi}</p>
            <p className="mt-2">{ayarlar.slogan}</p>
          </div>
          <div>
            <p className="font-semibold text-white">Kurumsal</p>
            <p className="mt-2">Hakkımızda</p>
            <p>Kariyer</p>
            <p>Gizlilik Politikası</p>
          </div>
          <div>
            <p className="font-semibold text-white">Yardım</p>
            <p className="mt-2">Sipariş Takibi</p>
            <p>İade ve Değişim</p>
            <p>Sıkça Sorulanlar</p>
          </div>
          {ayarlar.bolumler.iletisim && (
            <div>
              <p className="font-semibold text-white">İletişim</p>
              <p className="mt-2">📍 İstanbul, Türkiye</p>
              <p>📞 0850 000 00 00</p>
              <p>✉️ destek@siteniz.com</p>
            </div>
          )}
        </div>
        <p className="mx-auto mt-8 max-w-7xl border-t border-zinc-800 pt-6 text-xs">
          © {ayarlar.magazaAdi}. Tüm hakları saklıdır.
        </p>
      </footer>
    </div>
  );
}
