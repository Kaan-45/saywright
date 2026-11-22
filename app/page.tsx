// ─────────────────────────────────────────────────────────────
// app/page.tsx — Saywright tanıtım (vitrin) sayfası: localhost:3000
//
// Ziyaretçiyi karşılayan, ürünü anlatan ve kayda yönlendiren sayfa.
// Burada kişiye özel bilgi olmadığı için sayfa önceden hazırlanır (çok hızlı açılır).
// ─────────────────────────────────────────────────────────────

import Link from "next/link";
import Logo from "@/components/Logo";
import OrnekGaleri from "@/components/OrnekGaleri";
import { ORNEK_SITELER } from "@/components/ornekSiteler";
import { MiniOnizleme } from "@/components/SiteOnizleme";
import { KARSILASTIRMA, PLANLAR, type PlanKodu } from "@/lib/planlar";

const SSS = [
  ["Kod bilmem gerekiyor mu?", "Hayır. Nasıl bir site istediğini günlük Türkçeyle yazman yeterli; gerisini Saywright halleder."],
  [
    "Ücretsiz planda neler var?",
    `Kayıt olan herkes ${PLANLAR.ucretsiz.siteHakki} site oluşturma hakkı kazanır. Her sitede ${PLANLAR.ucretsiz.siteBasinaMesaj} düzenleme mesajı gönderebilir, sonucu canlı önizlemede görebilirsin.`,
  ],
  [
    "Pro ile Tam Hizmet arasındaki fark ne?",
    "Pro tek seferlik bir ödemedir: siteni yayına alır ve admin paneliyle birlikte sana teslim ederiz; sonrasında ürün ekleme, silme, fiyat güncelleme gibi işleri kendin yaparsın, aylık ücret ödemezsin. Tam Hizmet ise aylık bir pakettir; bu işlerin hepsini ekibimiz senin yerine yapar.",
  ],
  ["Hangi tür siteler yapılabiliyor?", "Şu an alışveriş (e-ticaret) siteleri. Restoran, portfolyo ve kurumsal site şablonları çok yakında."],
  ["Daha sonra paket değiştirebilir miyim?", "Evet. Ücretsiz planda tasarladığın siteyi \"Yayınla\" dediğinde Pro'ya geçerek yayına alabilirsin; tasarımın olduğu gibi korunur."],
  [
    "Alan adı (siteadin.com) almam gerekiyor mu?",
    "Hayır, hiçbir teknik işle uğraşmazsın. Yayınla derken istediğin adı ve uzantıyı (.com, .com.tr…) yazarsın; alan adını biz satın alır, sitene biz bağlarız. Pro'da ilk yıl 500 ₺'ye kadar olan alan adı hediyedir, Tam Hizmet'te her yıl dahildir. Zaten bir alan adın varsa onu da bağlayabiliriz.",
  ],
  [
    "Alan adı fiyatları neden değişiyor?",
    "Her uzantının fiyatını dünya genelindeki kayıt kuruluşları belirler ve fiyatlar dolar kuruna bağlıdır. .com ve .com.tr genelde pakete dahil bütçenin içinde kalır; .store, .shop gibi bazı uzantılar daha pahalı olabilir. Bütçeyi aşarsa farkı ve 2. yıldan sonraki yenileme ücretini satın almadan önce sana açıkça söyleriz, onayın olmadan hiçbir ücret alınmaz.",
  ],
  [
    "Yayınla dedikten sonra ne oluyor?",
    "Talebin ekibimize ulaşır. Ödemeni ve sitenin içeriğini kontrol edip onaylarız; onaydan hemen sonra siten Saywright adresinde yayına girer. Alan adın bağlandığında (genelde 1 iş günü içinde) aynı site kendi adresinden de açılır.",
  ],
];

// ── "Nasıl çalışır?" adımlarının sağ taraftaki küçük çizimleri ──
function AdimGorseli({ no }: { no: number }) {
  const kart = "rounded-2xl border border-cizgi bg-kart p-5 shadow-sm";
  if (no === 1)
    return (
      <div className={kart}>
        <p className="text-sm font-semibold">Ücretsiz hesap oluştur</p>
        {["Adın", "E-posta", "Şifre"].map((a) => (
          <div key={a} className="mt-3 rounded-lg border border-cizgi bg-white/70 px-3 py-2 text-xs text-derin/60">
            {a}
          </div>
        ))}
        <div className="mt-4 rounded-lg bg-gece py-2 text-center text-xs font-semibold text-white">Hesabımı oluştur</div>
        <p className="mt-3 text-center text-xs text-deniz">🎁 Hesabına 1 site hakkı tanımlandı</p>
      </div>
    );
  if (no === 2)
    return (
      <div className={kart}>
        <div className="ml-auto max-w-[95%] rounded-2xl rounded-br-md bg-derin px-4 py-3 text-sm leading-relaxed text-white">
          <mark className="rounded bg-nane px-1 text-gece">El yapımı mumlar</mark> satıyorum. Adı{" "}
          <mark className="rounded bg-nane px-1 text-gece">Lavmira Mum</mark> olsun,{" "}
          <mark className="rounded bg-nane px-1 text-gece">bej ve toprak tonlarında</mark>,{" "}
          <mark className="rounded bg-nane px-1 text-gece">SSS bölümü</mark> de olsun.
        </div>
        <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-medium">
          {["📦 Ne satıyorsun?", "🏷️ Mağaza adı", "🎨 Renkler", "🧩 Bölümler"].map((e) => (
            <span key={e} className="rounded-full bg-nane/60 px-2.5 py-1 text-derin">
              {e}
            </span>
          ))}
        </div>
      </div>
    );
  if (no === 3)
    return (
      <div className={kart}>
        <p className="flex items-center gap-2 text-sm font-semibold">
          <span className="h-2 w-2 animate-pulse rounded-full bg-deniz" /> Siten hazırlanıyor…
        </p>
        <ul className="mt-4 space-y-2.5 text-sm">
          {[
            "Mağaza adı ve slogan",
            "Renk paleti ve tasarım",
            "8 ürün: ad, fiyat, açıklama",
            "Kampanya vitrini ve kategoriler",
            "Hakkımızda, yorumlar, SSS, iletişim",
          ].map((m) => (
            <li key={m} className="flex items-center gap-2">
              <span className="grid h-5 w-5 place-items-center rounded-full bg-nane text-[11px] text-derin">✓</span>
              {m}
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-derin/60">Ortalama süre: 20-40 saniye</p>
      </div>
    );
  if (no === 4)
    return (
      <div className={`${kart} space-y-3 text-sm`}>
        {[
          ["Ana rengi koyu yeşil yap", "Ana rengi koyu yeşil yaptım 🌿"],
          ["Lavanta mumun fiyatı 289 TL olsun", "Fiyatı güncelledim."],
        ].map(([soru, cevap]) => (
          <div key={soru} className="space-y-2">
            <div className="ml-auto w-fit rounded-2xl rounded-br-md bg-derin px-3 py-2 text-white">{soru}</div>
            <div className="w-fit rounded-2xl rounded-bl-md bg-white px-3 py-2 ring-1 ring-cizgi">{cevap}</div>
          </div>
        ))}
      </div>
    );
  return (
    <div className="grid gap-3">
      {[
        ["Pro · tek seferlik", "Siten ve admin panelin teslim edilir, gerisi sende", "🧑‍💻"],
        ["Tam Hizmet · aylık", "Ekibimiz her şeyi senin yerine yönetsin", "🤝"],
      ].map(([plan, metin, ikon]) => (
        <div key={plan} className={`${kart} flex items-center gap-4`}>
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-nane text-xl">{ikon}</span>
          <div>
            <p className="text-sm font-semibold">{plan}</p>
            <p className="text-xs text-derin/70">{metin}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

const ADIMLAR = [
  {
    baslik: "Ücretsiz hesabını aç",
    metin: "30 saniyede kaydol, kredi kartı gerekmez. Hesabına hemen 1 site oluşturma hakkı tanımlanır.",
    ipucu: null,
  },
  {
    baslik: "Siteni kendi cümlelerinle anlat",
    metin:
      "Bir arkadaşına anlatır gibi yaz. Ne kadar detay verirsen sonuç o kadar sana benzer; vermediğin detayları yapay zeka işine uygun şekilde tamamlar.",
    ipucu: "İpucu: Ne sattığını, mağazanın adını, sevdiğin renkleri ve olmasını istediğin bölümleri yazman yeterli.",
  },
  {
    baslik: "Yapay zeka siteni kursun",
    metin:
      "Saniyeler içinde mağaza adın, sloganın, renk paletin, ürünlerin (ad, fiyat, açıklama), kampanya alanı ve tüm sayfa bölümleri hazırlanır. Sonucu anında sağdaki önizlemede görürsün.",
    ipucu: null,
  },
  {
    baslik: "Sohbet ederek düzenle",
    metin:
      "Beğenmediğin her şeyi tek bir mesajla değiştir: renkler, ürünler, fiyatlar, yazılar, bölümler. Siten hesabında kaydedilir; istediğin zaman kaldığın yerden devam edebilirsin.",
    ipucu: "İpucu: Birden fazla değişikliği tek mesajda isteyebilirsin.",
  },
  {
    baslik: "Yayına al, büyüt",
    metin:
      "Hazır olduğunda paketini seç. Pro ile tek seferlik ödersin; siten yayına alınır, admin paneliyle birlikte sana teslim edilir. Tam Hizmet ile her ay her şeyi ekibimiz senin yerine yönetir.",
    ipucu: null,
  },
];

// ── Fiyat kartlarındaki "Nasıl bir site alırsın?" çizimleri ──
function PlanGorseli({ kod }: { kod: PlanKodu }) {
  if (kod === "ucretsiz")
    return (
      <div className="relative h-36 overflow-hidden rounded-xl border border-cizgi bg-white/60">
        <div className="flex gap-1 border-b border-cizgi px-2 py-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-cizgi" />
          <span className="h-1.5 w-1.5 rounded-full bg-cizgi" />
          <span className="h-1.5 w-1.5 rounded-full bg-cizgi" />
        </div>
        <div className="space-y-2 p-3">
          <div className="h-10 rounded-md bg-nane/70" />
          <div className="grid grid-cols-3 gap-2">
            <div className="h-10 rounded-md bg-zemin" />
            <div className="h-10 rounded-md bg-zemin" />
            <div className="h-10 rounded-md bg-zemin" />
          </div>
        </div>
        <span className="absolute inset-0 grid place-items-center">
          <span className="-rotate-12 rounded-md border-2 border-deniz/60 px-3 py-1 text-xs font-bold tracking-[0.3em] text-deniz/80">
            ÖNİZLEME
          </span>
        </span>
      </div>
    );
  if (kod === "pro")
    return (
      <div className="h-36 overflow-hidden rounded-xl border border-white/15 bg-white/5 text-[11px]">
        <div className="flex items-center justify-between border-b border-white/10 px-3 py-2">
          <span className="font-semibold">⚙️ Admin Paneli · Ürünler</span>
          <span className="rounded bg-nane px-2 py-0.5 font-semibold text-gece">+ Ürün ekle</span>
        </div>
        {[
          ["🕯️ Lavanta Mum", "289 TL", "Stokta"],
          ["🫙 Soya Mum Seti", "449 TL", "Stokta"],
          ["🪔 Seramik Mumluk", "199 TL", "Tükendi"],
        ].map(([ad, fiyat, durum]) => (
          <div key={ad} className="flex items-center justify-between gap-2 whitespace-nowrap border-b border-white/5 px-3 py-1.5">
            <span className="truncate">{ad}</span>
            <span className="flex shrink-0 items-center gap-2 text-white/70">
              {fiyat}
              <span className={durum === "Stokta" ? "text-nane" : "text-rose-300"}>{durum}</span>
              <span>✏️</span>
              <span>🗑️</span>
            </span>
          </div>
        ))}
      </div>
    );
  return (
    <div className="h-36 rounded-xl border border-cizgi bg-white/60 p-3 text-[11px]">
      <div className="flex items-center gap-2">
        <div className="flex -space-x-2">
          {["A", "M", "Z"].map((h, i) => (
            <span
              key={h}
              className="grid h-7 w-7 place-items-center rounded-full border-2 border-white text-[10px] font-bold text-white"
              style={{ background: ["#2F4A63", "#5B91A3", "#131B2B"][i] }}
            >
              {h}
            </span>
          ))}
        </div>
        <span className="font-semibold">Ekibin senin için çalışıyor</span>
      </div>
      <ul className="mt-3 space-y-1.5">
        {["Yeni ürünler yüklendi", "Ödeme altyapısı kuruldu", "Kasım SEO raporu gönderildi"].map((m) => (
          <li key={m} className="flex items-center gap-2">
            <span className="text-deniz">✓</span>
            {m}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function TanitimSayfasi() {
  return (
    <div className="bg-zemin text-gece">
      {/* ── Üst menü ── */}
      <header className="sticky top-0 z-30 border-b border-cizgi/70 bg-zemin/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Logo />
          <nav className="hidden gap-8 text-sm text-derin md:flex">
            <a href="#nasil" className="hover:text-gece">Nasıl çalışır?</a>
            <a href="#ornekler" className="hover:text-gece">Örnekler</a>
            <a href="#fiyatlar" className="hover:text-gece">Paketler</a>
            <a href="#sss" className="hover:text-gece">SSS</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/giris" className="rounded-lg px-3 py-2 text-sm font-medium text-derin hover:bg-nane/50">
              Giriş yap
            </Link>
            <Link href="/kayit" className="rounded-lg bg-gece px-4 py-2 text-sm font-semibold text-white hover:bg-derin">
              Ücretsiz başla
            </Link>
          </div>
        </div>
      </header>

      {/* ── Karşılama ── */}
      <section className="relative overflow-hidden">
        <div className="absolute left-1/2 top-0 -z-0 h-[480px] w-[900px] -translate-x-1/2 rounded-full bg-nane/70 blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-20 text-center sm:px-6 sm:pt-28">
          <span className="inline-flex items-center gap-2 rounded-full border border-deniz/30 bg-kart px-4 py-1.5 text-xs font-medium text-derin">
            <span className="h-1.5 w-1.5 rounded-full bg-deniz" /> Yapay zeka destekli site oluşturucu
          </span>
          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-extrabold tracking-tight sm:text-6xl">
            Sen anlat, <span className="text-deniz">siten saniyeler içinde</span> hazır olsun.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-derin">
            Kod yazmadan, tasarımcı beklemeden, yapay zekayla saatlerce uğraşmadan. Ne istediğini Türkçe yaz; Saywright
            alışveriş siteni senin için kursun.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/kayit"
              className="rounded-xl bg-gece px-7 py-3.5 font-semibold text-white shadow-xl shadow-gece/20 transition hover:bg-derin"
            >
              Ücretsiz dene · {PLANLAR.ucretsiz.siteHakki} site hediye
            </Link>
            <a href="#nasil" className="rounded-xl px-7 py-3.5 font-semibold text-derin hover:bg-nane/50">
              Nasıl çalışır? ↓
            </a>
          </div>
          <p className="mt-4 text-xs text-derin/60">Kredi kartı gerekmez · 30 saniyede kayıt</p>

          {/* Ürün görseli: sohbet + önizleme */}
          <div className="mx-auto mt-16 max-w-5xl overflow-hidden rounded-2xl border border-cizgi bg-kart text-left shadow-2xl shadow-gece/10">
            <div className="flex items-center gap-1.5 border-b border-cizgi bg-zemin px-4 py-2.5">
              <span className="h-3 w-3 rounded-full bg-[#ff6b6b]" />
              <span className="h-3 w-3 rounded-full bg-[#ffd166]" />
              <span className="h-3 w-3 rounded-full bg-[#06d6a0]" />
            </div>
            <div className="grid md:grid-cols-[280px_1fr]">
              <div className="hidden space-y-3 border-r border-cizgi p-4 text-sm md:block">
                <div className="ml-auto w-fit max-w-[90%] rounded-2xl rounded-br-md bg-derin px-3 py-2 text-white">
                  {ORNEK_SITELER[0].istek}
                </div>
                <div className="w-fit max-w-[90%] rounded-2xl rounded-bl-md bg-white px-3 py-2 ring-1 ring-cizgi">
                  Mağazana “Çarşıvio” adını verdim; kampanya vitrini, 8 kategori ve indirimli ürünlerle mor tonlarda bir
                  tasarım hazırladım. ✨
                </div>
              </div>
              <MiniOnizleme site={ORNEK_SITELER[0]} olcek={0.6} yukseklik="h-96" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Güven şeridi ── */}
      <section className="border-y border-cizgi bg-kart">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 py-8 text-center sm:px-6 md:grid-cols-4">
          {[
            ["< 1 dk", "İlk taslak süresi"],
            ["0 satır", "Yazman gereken kod"],
            ["%100", "Türkçe anlatım"],
            ["7/24", "Her an hazır"],
          ].map(([deger, etiket]) => (
            <div key={etiket}>
              <p className="text-2xl font-extrabold text-derin">{deger}</p>
              <p className="text-sm text-derin/60">{etiket}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Nasıl çalışır ── */}
      <section id="nasil" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-24 sm:px-6">
        <p className="text-center text-sm font-semibold tracking-widest text-deniz">NASIL ÇALIŞIR?</p>
        <h2 className="mt-2 text-center text-3xl font-bold tracking-tight sm:text-4xl">Fikirden yayına 5 adım</h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-derin">
          Teknik hiçbir şey bilmene gerek yok. İşte bir sitenin Saywright&apos;ta doğuşu:
        </p>

        <div className="relative mt-16 space-y-16">
          {/* adımları birleştiren dikey çizgi */}
          <div className="absolute bottom-0 left-5 top-0 hidden w-px bg-cizgi md:block" />
          {ADIMLAR.map((a, i) => (
            <div key={a.baslik} className="relative grid items-center gap-8 md:grid-cols-2 md:pl-16">
              <span className="absolute left-0 top-0 hidden h-10 w-10 place-items-center rounded-full bg-gece text-sm font-bold text-nane ring-8 ring-zemin md:grid">
                {i + 1}
              </span>
              <div>
                <p className="text-sm font-semibold text-deniz md:hidden">Adım {i + 1}</p>
                <h3 className="text-2xl font-bold">{a.baslik}</h3>
                <p className="mt-3 leading-relaxed text-derin">{a.metin}</p>
                {a.ipucu && (
                  <p className="mt-4 rounded-xl border-l-4 border-deniz bg-nane/40 px-4 py-3 text-sm text-derin">{a.ipucu}</p>
                )}
              </div>
              <AdimGorseli no={i + 1} />
            </div>
          ))}
        </div>
      </section>

      {/* ── Örnekler ── */}
      <section id="ornekler" className="scroll-mt-20 border-y border-cizgi bg-kart py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="text-center text-sm font-semibold tracking-widest text-deniz">ÖRNEKLER</p>
          <h2 className="mt-2 text-center text-3xl font-bold tracking-tight sm:text-4xl">Anlat, gerisini bize bırak</h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-derin">
            Örneklerden birine tıkla, siteyi büyütüp baştan sona incele. (Örnekteki markalar hayalidir.)
          </p>
          <OrnekGaleri />
        </div>
      </section>

      {/* ── Paketler ── */}
      <section id="fiyatlar" className="scroll-mt-20 py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="text-center text-sm font-semibold tracking-widest text-deniz">PAKETLER</p>
          <h2 className="mt-2 text-center text-3xl font-bold tracking-tight sm:text-4xl">Hangi paket sana uygun?</h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-derin">
            Paketler tek bir soruya göre ayrılıyor: <strong>siteni kim yönetecek?</strong> Önce ücretsiz dene, hazır
            olduğunda siteni ya kendin yönet ya da bize bırak.
          </p>

          <div className="mt-14 grid gap-6 lg:grid-cols-3">
            {(Object.entries(PLANLAR) as [PlanKodu, (typeof PLANLAR)[PlanKodu]][]).map(([kod, p]) => {
              const one = kod === "pro";
              return (
                <div
                  key={kod}
                  className={`relative flex flex-col rounded-3xl p-7 ${
                    one ? "bg-gece text-white shadow-2xl shadow-gece/30" : "border border-cizgi bg-kart"
                  }`}
                >
                  {one && (
                    <span className="absolute -top-3 left-7 rounded-full bg-nane px-3 py-1 text-xs font-bold text-gece">
                      En çok tercih edilen
                    </span>
                  )}
                  <div className="flex items-baseline justify-between">
                    <h3 className="text-xl font-bold">{p.ad}</h3>
                    <p>
                      <span className="text-3xl font-extrabold">{p.fiyat.toLocaleString("tr-TR")} ₺</span>
                      {p.odeme !== "ucretsiz" && (
                        <span className={`block text-right text-xs ${one ? "text-nane" : "text-derin/60"}`}>
                          {p.odeme === "tek" ? "tek seferlik" : "her ay"}
                        </span>
                      )}
                    </p>
                  </div>
                  <p className={`mt-1 text-sm ${one ? "text-white/70" : "text-derin"}`}>{p.kimIcin}</p>

                  <div className="mt-6">
                    <p className={`mb-2 text-xs font-semibold tracking-wider ${one ? "text-nane" : "text-deniz"}`}>
                      NASIL BİR SİTE ALIRSIN?
                    </p>
                    <PlanGorseli kod={kod} />
                    <p className={`mt-3 text-sm ${one ? "text-white/85" : "text-gece"}`}>{p.neAlirsin}</p>
                    <p
                      className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                        one ? "bg-white/10 text-nane" : "bg-nane/60 text-derin"
                      }`}
                    >
                      👤 {p.kimYonetir}
                    </p>
                  </div>

                  <ul className="mt-6 flex-1 space-y-2.5 text-sm">
                    {p.ozellikler.map((oz) => (
                      <li key={oz} className="flex gap-2">
                        <span className={one ? "text-nane" : "text-deniz"}>✓</span>
                        {oz}
                      </li>
                    ))}
                  </ul>
                  {p.satista ? (
                    <Link
                      href="/kayit"
                      className={`mt-8 rounded-xl py-3 text-center text-sm font-semibold ${
                        one ? "bg-nane text-gece hover:bg-white" : "bg-gece text-white hover:bg-derin"
                      }`}
                    >
                      {kod === "ucretsiz" ? "Ücretsiz başla" : "Ücretsiz dene, beğenince yayınla"}
                    </Link>
                  ) : (
                    <span
                      className={`mt-8 rounded-xl py-3 text-center text-sm font-semibold ${
                        one ? "bg-nane text-gece" : "bg-zemin text-derin"
                      }`}
                    >
                      Çok yakında
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Karşılaştırma tablosu */}
          <div className="mt-16 overflow-x-auto rounded-3xl border border-cizgi bg-kart">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-cizgi text-left">
                  <th className="p-4 font-semibold text-derin">Paketleri karşılaştır</th>
                  {Object.values(PLANLAR).map((p) => (
                    <th key={p.ad} className="p-4 text-center font-bold">
                      {p.ad}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {KARSILASTIRMA.map(([ozellik, ...degerler]) => (
                  <tr key={ozellik} className="border-b border-cizgi/60 last:border-0">
                    <td className="p-4 text-derin">{ozellik}</td>
                    {degerler.map((d, i) => (
                      <td key={i} className="p-4 text-center">
                        {d === true ? (
                          <span className="font-bold text-deniz">✓</span>
                        ) : d === false ? (
                          <span className="text-cizgi">—</span>
                        ) : (
                          <span className="font-medium">{d}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── SSS ── */}
      <section id="sss" className="mx-auto max-w-3xl scroll-mt-20 px-4 pb-24 sm:px-6">
        <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">Sıkça sorulan sorular</h2>
        <div className="mt-12 divide-y divide-cizgi rounded-2xl border border-cizgi bg-kart">
          {SSS.map(([soru, cevap]) => (
            <details key={soru} className="group px-6 py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between font-medium">
                {soru}
                <span className="text-xl text-deniz transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-derin">{cevap}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ── Son çağrı ── */}
      <section className="px-4 pb-24 sm:px-6">
        <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl bg-gece px-6 py-16 text-center text-white">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-deniz/30 blur-3xl" />
          <div className="absolute -bottom-24 -left-10 h-72 w-72 rounded-full bg-nane/20 blur-3xl" />
          <h2 className="relative text-3xl font-bold tracking-tight sm:text-4xl">İlk siten bir mesaj uzağında</h2>
          <p className="relative mx-auto mt-4 max-w-lg text-white/70">
            Hemen ücretsiz kaydol, {PLANLAR.ucretsiz.siteHakki} site oluşturma hakkını kullanmaya başla.
          </p>
          <Link
            href="/kayit"
            className="relative mt-8 inline-block rounded-xl bg-nane px-7 py-3.5 font-semibold text-gece transition hover:bg-white"
          >
            Ücretsiz başla
          </Link>
        </div>
      </section>

      <footer className="border-t border-cizgi">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-derin/70 sm:flex-row sm:px-6">
          <Logo />
          <p>Saywright · You say it, we build it.</p>
        </div>
      </footer>
    </div>
  );
}
