// ─────────────────────────────────────────────────────────────
// YayinSihirbazi.tsx — "Siteni yayınla" ekranı
//
// Üç durumdan birini gösterir:
//   • Site onaylı          → "Siten yayında" kartı
//   • Bekleyen talep var   → talep özeti + (gerekiyorsa) havale bilgileri
//   • Talep yok / reddedildi → adres, alan adı ve paket seçimi formu
// ─────────────────────────────────────────────────────────────
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import { UZANTILAR, alanAdiKokuHatasi, bagliAlanAdiHatasi, type Uzanti } from "@/lib/alanAdi";
import type { HavaleBilgileri } from "@/lib/odeme";
import { slugHatasi, slugOlustur } from "@/lib/yardimci";
import type { YayinTalebi } from "@/lib/yayinTalepleri";

type Paket = {
  mevcutAd: string;
  odemeGerekli: boolean;
  hedefAd: string;
  fiyat: number;
  alanAdiButcesi: number;
  hakDolu: string | null;
};

type Props = {
  siteId: string;
  magazaAdi: string;
  onayli: boolean;
  yayinda: boolean;
  mevcutSlug: string | null;
  bagliAlanAdi: string | null;
  onerilenSlug: string;
  onerilenKok: string;
  sonTalep: YayinTalebi | null;
  paket: Paket;
  havale: HavaleBilgileri;
};

const tl = (n: number) => `${n.toLocaleString("tr-TR")} ₺`;
const kart = "rounded-3xl border border-cizgi bg-kart p-6";

function useKokAdres() {
  return useSyncExternalStore(
    () => () => {},
    () => window.location.host,
    () => "saywright",
  );
}

export default function YayinSihirbazi(p: Props) {
  return (
    <>
      <Link href="/panel/projeler" className="text-sm text-derin hover:text-gece">
        ← Projelerime dön
      </Link>
      <h1 className="mt-3 text-3xl font-bold tracking-tight">🚀 {p.magazaAdi}</h1>
      {p.onayli ? <OnayliKart {...p} /> : p.sonTalep?.durum === "bekliyor" ? <BekleyenKart {...p} talep={p.sonTalep} /> : <TalepFormu {...p} />}
    </>
  );
}

// ── 1) Site onaylı ──
function OnayliKart({ siteId, yayinda, mevcutSlug, bagliAlanAdi, sonTalep }: Props) {
  const kok = useKokAdres();
  const istenen = sonTalep?.durum === "onaylandi" ? sonTalep.alanAdi : null;
  return (
    <section className="mt-6 rounded-3xl bg-gece p-6 text-white sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-widest text-nane">Yayın onayı</p>
      <h2 className="mt-2 text-2xl font-extrabold">✅ Siten onaylandı</h2>
      <p className="mt-1 text-white/70">
        {yayinda ? "Siten şu an herkese açık." : "Siten onaylı ama şu an yayında değil. Admin panelinden tekrar yayına alabilirsin."}
      </p>
      <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
        <div className="rounded-2xl bg-white/5 p-4">
          <dt className="text-white/60">Saywright adresin</dt>
          <dd className="mt-1 break-all font-semibold">{kok}/m/{mevcutSlug}</dd>
        </div>
        <div className="rounded-2xl bg-white/5 p-4">
          <dt className="text-white/60">Kendi alan adın</dt>
          <dd className="mt-1 font-semibold">
            {bagliAlanAdi ? `🌐 ${bagliAlanAdi} · bağlı` : istenen ? `⏳ ${istenen} · hazırlanıyor (genelde 1 iş günü)` : "Yok"}
          </dd>
        </div>
      </dl>
      <div className="mt-6 flex flex-wrap gap-2">
        {yayinda && mevcutSlug && (
          <a href={`/m/${mevcutSlug}`} target="_blank" rel="noreferrer" className="rounded-xl bg-nane px-5 py-2.5 text-sm font-semibold text-gece hover:bg-white">
            Siteyi aç ↗
          </a>
        )}
        <Link href={`/yonetim/${siteId}`} className="rounded-xl border border-white/20 px-5 py-2.5 text-sm font-semibold hover:bg-white/10">
          ⚙️ Admin paneline git
        </Link>
      </div>
    </section>
  );
}

// ── 2) Bekleyen talep ──
function KopyalaSatiri({ etiket, deger }: { etiket: string; deger: string }) {
  const [kopyalandi, setKopyalandi] = useState(false);
  return (
    <div className="flex items-center justify-between gap-3 border-b border-cizgi py-2.5 last:border-0">
      <div className="min-w-0">
        <p className="text-xs text-derin/70">{etiket}</p>
        <p className="break-all font-mono text-sm font-semibold">{deger}</p>
      </div>
      <button
        onClick={async () => {
          await navigator.clipboard.writeText(deger);
          setKopyalandi(true);
          setTimeout(() => setKopyalandi(false), 1500);
        }}
        className="shrink-0 rounded-lg border border-cizgi bg-white px-2.5 py-1 text-xs font-semibold hover:bg-zemin"
      >
        {kopyalandi ? "✓" : "Kopyala"}
      </button>
    </div>
  );
}

function BekleyenKart({ siteId, paket, talep, havale }: Props & { talep: YayinTalebi }) {
  const router = useRouter();
  const kok = useKokAdres();
  const [bekliyor, setBekliyor] = useState(false);
  const [hata, setHata] = useState("");
  const odemeVar = talep.tutarKurus > 0;

  async function geriCek() {
    if (!confirm("Yayın talebini geri çekmek istediğine emin misin?")) return;
    setBekliyor(true);
    const y = await fetch(`/api/siteler/${siteId}/yayin-talebi`, { method: "DELETE" });
    setBekliyor(false);
    if (!y.ok) return setHata((await y.json().catch(() => ({}))).hata ?? "Geri çekilemedi.");
    router.refresh();
  }

  const adimlar = [
    { ad: "Talep gönderildi", tamam: true },
    { ad: odemeVar ? "Ödemen kontrol ediliyor" : "Ödeme gerekmiyor", tamam: !odemeVar },
    { ad: "Site içeriği inceleniyor", tamam: false },
    { ad: "Yayında", tamam: false },
  ];

  return (
    <div className="mt-6 space-y-5">
      <section className="rounded-3xl border border-amber-300 bg-amber-50 p-6">
        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">⏳ Onay bekliyor</span>
        <h2 className="mt-3 text-xl font-bold">Talebin ekibimize ulaştı</h2>
        <p className="mt-1 text-sm text-derin">
          {odemeVar
            ? "Ödemen hesabımıza geçtikten sonra siteni kontrol edip onaylıyoruz. Onaydan hemen sonra siten yayına girer."
            : "Siteni kısa bir kontrolden geçirip onaylıyoruz. Onaydan hemen sonra siten yayına girer."}
        </p>
        <ol className="mt-5 grid gap-2 sm:grid-cols-4">
          {adimlar.map((a, i) => (
            <li key={a.ad} className={`rounded-xl px-3 py-2 text-xs font-medium ${a.tamam ? "bg-emerald-100 text-emerald-800" : "bg-white text-derin"}`}>
              {a.tamam ? "✓" : `${i + 1}.`} {a.ad}
            </li>
          ))}
        </ol>
      </section>

      {odemeVar && (
        <section className={kart}>
          <h2 className="font-semibold">💳 Havale / EFT bilgileri</h2>
          <p className="mt-1 text-sm text-derin">
            Lütfen açıklama kısmına <b>ödeme kodunu</b> yaz; ödemenin sana ait olduğunu böyle anlıyoruz.
          </p>
          {havale.ornekMi && (
            <p className="mt-3 rounded-lg border border-dashed border-amber-400 bg-amber-50 px-3 py-2 text-xs text-amber-800">
              🧪 Bu hesap bilgileri örnektir. Lütfen henüz ödeme yapma.
            </p>
          )}
          <div className="mt-4 rounded-2xl border border-cizgi bg-white/70 px-4">
            <KopyalaSatiri etiket="Alıcı" deger={havale.alici} />
            <KopyalaSatiri etiket={`IBAN · ${havale.banka}`} deger={havale.iban} />
            <KopyalaSatiri etiket="Tutar" deger={tl(talep.tutarKurus / 100)} />
            <KopyalaSatiri etiket="Açıklama (ödeme kodu)" deger={talep.odemeKodu} />
          </div>
        </section>
      )}

      <section className={kart}>
        <h2 className="font-semibold">Talep özeti</h2>
        <dl className="mt-3 divide-y divide-cizgi text-sm">
          <Satir etiket="Saywright adresi" deger={`${kok}/m/${talep.slug}`} />
          <Satir
            etiket="Kendi alan adın"
            deger={talep.alanAdi ? `${talep.alanAdi} · ${talep.alanAdiTuru === "mevcut" ? "zaten senin, bağlanacak" : "bizim alacağımız"}` : "İstemiyorum"}
          />
          <Satir etiket="Paket" deger={odemeVar ? `${paket.hedefAd} · ${tl(talep.tutarKurus / 100)} tek seferlik` : `${paket.mevcutAd} · ek ücret yok`} />
          <Satir etiket="Gönderilme" deger={new Date(talep.olusturma).toLocaleString("tr-TR", { dateStyle: "long", timeStyle: "short" })} />
        </dl>
        {hata && <p className="mt-3 text-sm text-rose-700">{hata}</p>}
        <button onClick={geriCek} disabled={bekliyor} className="mt-4 rounded-xl px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-40">
          {bekliyor ? "Geri çekiliyor…" : "Talebi geri çek"}
        </button>
      </section>
    </div>
  );
}

function Satir({ etiket, deger }: { etiket: string; deger: string }) {
  return (
    <div className="flex flex-wrap justify-between gap-x-4 gap-y-1 py-2.5">
      <dt className="text-derin/70">{etiket}</dt>
      <dd className="break-all text-right font-medium">{deger}</dd>
    </div>
  );
}

// ── 3) Talep formu ──
function TalepFormu({ siteId, onerilenSlug, onerilenKok, sonTalep, paket }: Props) {
  const router = useRouter();
  const kok = useKokAdres();
  const [slug, setSlug] = useState(onerilenSlug);
  const [secim, setSecim] = useState<"yeni" | "mevcut" | "yok">("yeni");
  const [alanKoku, setAlanKoku] = useState(onerilenKok);
  const [uzanti, setUzanti] = useState<Uzanti>(".com");
  const [mevcutAlan, setMevcutAlan] = useState("");
  const [onay, setOnay] = useState(false);
  const [bekliyor, setBekliyor] = useState(false);
  const [hata, setHata] = useState("");

  const slugHata = slugHatasi(slug);
  const alanHata =
    secim === "yeni" ? alanAdiKokuHatasi(alanKoku) : secim === "mevcut" ? (mevcutAlan ? bagliAlanAdiHatasi(mevcutAlan) : "Alan adını yaz.") : null;
  const secilenUzanti = UZANTILAR.find((u) => u.uzanti === uzanti)!;
  const fark = Math.max(0, secilenUzanti.tahmini - paket.alanAdiButcesi);
  const gonderilebilir = !slugHata && !alanHata && (!paket.odemeGerekli || onay) && !paket.hakDolu && !bekliyor;

  async function gonder() {
    setBekliyor(true);
    setHata("");
    try {
      const y = await fetch(`/api/siteler/${siteId}/yayin-talebi`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          alanAdiTuru: secim === "yok" ? null : secim,
          alanAdi: secim === "yeni" ? alanKoku + uzanti : secim === "mevcut" ? mevcutAlan : null,
        }),
      });
      if (!y.ok) return setHata((await y.json().catch(() => ({}))).hata ?? "Gönderilemedi.");
      router.refresh(); // sayfa "bekleyen talep" görünümüyle yeniden çizilsin
    } catch {
      setHata("Sunucuya ulaşılamadı.");
    } finally {
      setBekliyor(false);
    }
  }

  const secenek = (deger: typeof secim, baslik: string, aciklama: string) => (
    <label
      className={`flex cursor-pointer gap-3 rounded-2xl border p-4 transition ${secim === deger ? "border-deniz bg-nane/40" : "border-cizgi bg-white/60 hover:bg-white"}`}
    >
      <input type="radio" name="alan" checked={secim === deger} onChange={() => setSecim(deger)} className="mt-1 accent-[var(--color-derin)]" />
      <span>
        <span className="block text-sm font-semibold">{baslik}</span>
        <span className="block text-xs text-derin/80">{aciklama}</span>
      </span>
    </label>
  );

  return (
    <div className="mt-2 space-y-5">
      <p className="text-derin/80">Sitenin adresini seç, talebini gönder. Ekibimiz kontrol edip onaylayınca siten yayına girer.</p>

      {sonTalep?.durum === "reddedildi" && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          <p className="font-semibold">Önceki talebin onaylanmadı</p>
          {sonTalep.adminNotu && <p className="mt-1">Sebep: {sonTalep.adminNotu}</p>}
          <p className="mt-1">Gerekli düzeltmeyi yapıp yeniden talep gönderebilirsin.</p>
        </div>
      )}
      {sonTalep?.durum === "onaylandi" && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
          Siten ekibimiz tarafından yayından kaldırıldı. Sorunu giderdiysen yeniden talep gönderebilirsin.
        </div>
      )}

      {/* Adım 1 */}
      <section className={kart}>
        <p className="text-xs font-bold uppercase tracking-widest text-deniz">Adım 1</p>
        <h2 className="mt-1 font-semibold">Saywright adresin</h2>
        <p className="mt-1 text-sm text-derin">Onaydan hemen sonra siten bu adresten açılır. Kendi alan adın bağlanana kadar da bu adresi kullanabilirsin.</p>
        <div className="mt-4 flex overflow-hidden rounded-xl border border-cizgi bg-white focus-within:border-deniz focus-within:ring-4 focus-within:ring-nane">
          <span className="hidden shrink-0 items-center bg-zemin px-3 text-sm text-derin/70 sm:flex">{kok}/m/</span>
          <input
            value={slug}
            onChange={(e) => setSlug(slugOlustur(e.target.value) + (e.target.value.endsWith("-") ? "-" : ""))}
            maxLength={40}
            className="min-w-0 flex-1 px-3 py-2.5 text-sm outline-none"
            aria-label="Saywright adresi"
          />
        </div>
        {slug && slugHata && <p className="mt-1 text-xs text-rose-700">{slugHata}</p>}
      </section>

      {/* Adım 2 */}
      <section className={kart}>
        <p className="text-xs font-bold uppercase tracking-widest text-deniz">Adım 2</p>
        <h2 className="mt-1 font-semibold">🌐 Kendi alan adın</h2>
        <p className="mt-1 text-sm text-derin">
          Hiçbir teknik işle uğraşmazsın: adını seç, alan adını biz satın alıp sitene bağlayalım.{" "}
          <b>{paket.hedefAd}</b> paketinde {tl(paket.alanAdiButcesi)}&apos;ye kadar olan alan adı pakete dahil.
        </p>
        <div className="mt-4 grid gap-2">
          {secenek("yeni", "Yeni alan adı istiyorum", "Önerilen. Biz alır, biz bağlarız.")}
          {secim === "yeni" && (
            <div className="rounded-2xl border border-cizgi bg-white p-4">
              <div className="flex overflow-hidden rounded-xl border border-cizgi focus-within:border-deniz focus-within:ring-4 focus-within:ring-nane">
                <span className="hidden items-center bg-zemin px-3 text-sm text-derin/70 sm:flex">www.</span>
                <input
                  value={alanKoku}
                  onChange={(e) => setAlanKoku(slugOlustur(e.target.value).slice(0, 63) + (e.target.value.endsWith("-") ? "-" : ""))}
                  className="min-w-0 flex-1 px-3 py-2.5 text-sm outline-none"
                  placeholder="magazanadi"
                  aria-label="Alan adı"
                />
                <span className="flex items-center bg-zemin px-3 text-sm font-semibold">{uzanti}</span>
              </div>
              {alanKoku && alanHata && <p className="mt-1 text-xs text-rose-700">{alanHata}</p>}
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {UZANTILAR.map((u) => {
                  const f = Math.max(0, u.tahmini - paket.alanAdiButcesi);
                  return (
                    <button
                      key={u.uzanti}
                      type="button"
                      onClick={() => setUzanti(u.uzanti)}
                      className={`rounded-xl border px-3 py-2 text-left text-sm transition ${uzanti === u.uzanti ? "border-deniz bg-nane/40" : "border-cizgi hover:bg-zemin"}`}
                    >
                      <span className="flex justify-between gap-2">
                        <b>
                          {alanKoku || "adin"}
                          {u.uzanti}
                        </b>
                        <span className={f === 0 ? "text-emerald-700" : "text-amber-700"}>{f === 0 ? "Pakete dahil" : `+${tl(f)}`}</span>
                      </span>
                      {u.aciklama && <span className="block text-xs text-derin/70">{u.aciklama}</span>}
                    </button>
                  );
                })}
              </div>
              <p className="mt-3 text-xs text-derin/70">
                Fiyatlar tahminidir ve dolar kuruna göre değişebilir. Bu adın müsait olup olmadığını ve kesin fiyatı satın almadan önce kontrol eder, fark çıkarsa
                önce sana sorarız. 2. yıldan itibaren yıllık yenileme ücreti uygulanır.
              </p>
            </div>
          )}
          {secenek("mevcut", "Zaten bir alan adım var", "Senin adına kayıtlı alan adını sitene bağlarız.")}
          {secim === "mevcut" && (
            <div className="rounded-2xl border border-cizgi bg-white p-4">
              <input
                value={mevcutAlan}
                onChange={(e) => setMevcutAlan(e.target.value.trim().toLowerCase())}
                className="w-full rounded-xl border border-cizgi px-3 py-2.5 text-sm outline-none focus:border-deniz focus:ring-4 focus:ring-nane"
                placeholder="ornek.com"
                aria-label="Mevcut alan adı"
              />
              {mevcutAlan && alanHata && <p className="mt-1 text-xs text-rose-700">{alanHata}</p>}
              <p className="mt-2 text-xs text-derin/70">Onaydan sonra ekibimiz bağlantı için seninle iletişime geçecek.</p>
            </div>
          )}
          {secenek("yok", "Şimdilik istemiyorum", "Sadece Saywright adresiyle yayına al. İstediğin zaman ekleyebilirsin.")}
        </div>
      </section>

      {/* Adım 3 */}
      <section className={kart}>
        <p className="text-xs font-bold uppercase tracking-widest text-deniz">Adım 3</p>
        <h2 className="mt-1 font-semibold">Paket ve ödeme</h2>
        {paket.hakDolu ? (
          <p className="mt-3 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-800">{paket.hakDolu} Ek site için bizimle iletişime geç.</p>
        ) : paket.odemeGerekli ? (
          <>
            <div className="mt-3 flex flex-wrap items-baseline justify-between gap-2 rounded-2xl bg-gece p-5 text-white">
              <div>
                <p className="text-lg font-bold">{paket.hedefAd} paketi</p>
                <p className="text-sm text-white/70">Yayın + admin paneli + ilk yıl alan adı · aylık ücret yok</p>
              </div>
              <p className="text-2xl font-extrabold">{tl(paket.fiyat)}</p>
            </div>
            {secim === "yeni" && fark > 0 && (
              <p className="mt-2 text-xs text-amber-700">+ {secilenUzanti.uzanti} için tahmini {tl(fark)} alan adı farkı (satın almadan önce onayın alınır)</p>
            )}
            <p className="mt-3 text-sm text-derin">
              Ödeme şimdilik <b>havale / EFT</b> ile. Talebini gönderince hesap bilgilerini ve sana özel ödeme kodunu göreceksin.
            </p>
            <label className="mt-4 flex gap-3 text-sm">
              <input type="checkbox" checked={onay} onChange={(e) => setOnay(e.target.checked)} className="mt-0.5 accent-[var(--color-derin)]" />
              <span>
                {tl(paket.fiyat)} tutarındaki ödemeyi havale ile yapacağımı, sitemin ödeme ulaştıktan ve içerik kontrolünden sonra yayına alınacağını
                anlıyorum.
              </span>
            </label>
          </>
        ) : (
          <p className="mt-3 rounded-xl bg-nane/50 px-4 py-3 text-sm">
            ✓ <b>{paket.mevcutAd}</b> paketindesin, yayın için ek ücret yok.
            {secim === "yeni" && fark > 0 && ` (${secilenUzanti.uzanti} için tahmini ${tl(fark)} alan adı farkı olabilir.)`}
          </p>
        )}
      </section>

      {hata && <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{hata}</p>}
      <button
        onClick={gonder}
        disabled={!gonderilebilir}
        className="w-full rounded-2xl bg-gece py-3.5 text-base font-semibold text-white transition hover:bg-derin disabled:cursor-not-allowed disabled:opacity-40"
      >
        {bekliyor ? "Gönderiliyor…" : "🚀 Yayın talebini gönder"}
      </button>
    </div>
  );
}
