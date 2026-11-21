// ─────────────────────────────────────────────────────────────
// YayinKarti.tsx — Admin panelinde "Yayın durumu" kartı
// Adres (slug) seçme, yayınlama, yayından kaldırma, bağlantıyı kopyalama
// ─────────────────────────────────────────────────────────────
"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { slugHatasi, slugOlustur } from "@/lib/yardimci";

export type YayinDurumu = {
  yayinda: boolean;
  slug: string | null;
  onayli: boolean; // Saywright admini ilk yayını onayladı mı?
  talepBekliyor: boolean;
  alanAdi: string | null; // bağlanmış kendi alan adı
};

/** Henüz onaylanmamış site: yayın sihirbazına yönlendiren kart */
function OnaysizKart({ siteId, talepBekliyor }: { siteId: string; talepBekliyor: boolean }) {
  return (
    <div className={`rounded-2xl border p-5 ${talepBekliyor ? "border-amber-300 bg-amber-50" : "border-dashed border-deniz/50 bg-nane/20"}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-semibold">🌐 Yayın durumu</h2>
        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-derin ring-1 ring-cizgi">
          {talepBekliyor ? "⏳ Onay bekliyor" : "○ Yayında değil"}
        </span>
      </div>
      <p className="mt-1 text-sm text-derin">
        {talepBekliyor
          ? "Yayın talebin ekibimizde. Onaylandığında siten otomatik olarak yayına girecek."
          : "Siteni beğendiysen yayın talebi gönder: adresini ve alan adını seç, ekibimiz onaylayınca siten yayına girsin."}
      </p>
      <Link
        href={`/panel/yayinla/${siteId}`}
        className="mt-4 inline-block rounded-xl bg-gece px-5 py-2.5 text-sm font-semibold text-white hover:bg-derin"
      >
        {talepBekliyor ? "Talebimi görüntüle" : "🚀 Yayınla"}
      </Link>
    </div>
  );
}

export default function YayinKarti(p: { siteId: string; durum: YayinDurumu; setDurum: (d: YayinDurumu) => void }) {
  if (!p.durum.onayli) return <OnaysizKart siteId={p.siteId} talepBekliyor={p.durum.talepBekliyor} />;
  return <OnayliKart {...p} />;
}

function OnayliKart({
  siteId,
  durum,
  setDurum,
}: {
  siteId: string;
  durum: YayinDurumu;
  setDurum: (d: YayinDurumu) => void;
}) {
  const [slug, setSlug] = useState(durum.slug ?? "");
  // Sitenin kök adresi (örn. http://localhost:3000). Sunucuda bilinmez, tarayıcıda okunur.
  const kok = useSyncExternalStore(
    () => () => {},
    () => window.location.origin,
    () => "",
  );
  const [mesaj, setMesaj] = useState<{ tur: "basari" | "hata"; metin: string } | null>(null);
  const [bekliyor, setBekliyor] = useState(false);

  useEffect(() => {
    // Henüz adres yoksa mağaza adından bir öneri al
    if (!durum.slug)
      fetch(`/api/siteler/${siteId}/yayin`)
        .then((r) => r.json())
        .then((d) => d.slug && setSlug(d.slug))
        .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const adres = `${kok}/m/${durum.slug ?? slug}`;
  const yerelHata = slug ? slugHatasi(slug) : null;
  const adresDegisti = slug !== (durum.slug ?? "");

  async function kaydet(yayinda: boolean) {
    setBekliyor(true);
    setMesaj(null);
    const yanit = await fetch(`/api/siteler/${siteId}/yayin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // Yayından kaldırırken kutudaki (belki yarım yazılmış) adresi değil, kayıtlı adresi gönder
      body: JSON.stringify({ yayinda, slug: yayinda ? slug : (durum.slug ?? slug) }),
    });
    const sonuc = await yanit.json().catch(() => ({}));
    setBekliyor(false);
    if (!yanit.ok) return setMesaj({ tur: "hata", metin: sonuc.hata ?? "Kaydedilemedi." });
    setDurum({ ...durum, yayinda: sonuc.yayinda, slug: sonuc.slug });
    setMesaj({
      tur: "basari",
      metin: yayinda ? (durum.yayinda ? "Adres güncellendi." : "Siten yayında! 🎉 Bağlantıyı paylaşabilirsin.") : "Site yayından kaldırıldı.",
    });
  }

  return (
    <div className={`rounded-2xl border p-5 ${durum.yayinda ? "border-deniz/50 bg-nane/40" : "border-dashed border-deniz/50 bg-nane/20"}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-semibold">🌐 Yayın durumu</h2>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${durum.yayinda ? "bg-gece text-nane" : "bg-white text-derin ring-1 ring-cizgi"}`}
        >
          {durum.yayinda ? "● Yayında" : "○ Yayında değil"}
        </span>
      </div>
      <p className="mt-1 text-sm text-derin">
        {durum.yayinda
          ? "Siten herkese açık. Bu bağlantıyı müşterilerinle paylaşabilirsin."
          : "Yayınladığında siten aşağıdaki adresten herkese açılır. İstediğin zaman geri kaldırabilirsin."}
      </p>

      <label className="mt-4 block">
        <span className="text-xs font-semibold uppercase tracking-wider text-derin/70">Sitenin adresi</span>
        <div className="mt-1.5 flex overflow-hidden rounded-xl border border-cizgi bg-white focus-within:border-deniz focus-within:ring-4 focus-within:ring-nane">
          <span className="hidden shrink-0 items-center bg-zemin px-3 text-sm text-derin/70 sm:flex">{kok.replace(/^https?:\/\//, "")}/m/</span>
          <input
            value={slug}
            onChange={(e) => setSlug(slugOlustur(e.target.value) + (e.target.value.endsWith("-") ? "-" : ""))}
            maxLength={40}
            className="min-w-0 flex-1 px-3 py-2.5 text-sm outline-none"
            placeholder="magazanin-adi"
          />
        </div>
        {yerelHata && <span className="mt-1 block text-xs text-rose-700">{yerelHata}</span>}
      </label>
      <p className="mt-3 text-sm text-derin">
        Kendi alan adın:{" "}
        <b>{durum.alanAdi ? `🌐 ${durum.alanAdi}` : "henüz bağlanmadı"}</b>
        {!durum.alanAdi && <span className="text-derin/70"> (istediysen ekibimiz hazırlıyor)</span>}
      </p>

      {mesaj && (
        <p className={`mt-3 rounded-lg px-3 py-2 text-sm ${mesaj.tur === "basari" ? "bg-white text-derin" : "bg-rose-50 text-rose-700"}`}>
          {mesaj.metin}
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {!durum.yayinda ? (
          <button
            onClick={() => kaydet(true)}
            disabled={bekliyor || !!yerelHata || !slug}
            className="rounded-xl bg-gece px-5 py-2.5 text-sm font-semibold text-white hover:bg-derin disabled:opacity-40"
          >
            {bekliyor ? "Yayınlanıyor…" : "🚀 Yayınla"}
          </button>
        ) : (
          <>
            {adresDegisti && (
              <button
                onClick={() => kaydet(true)}
                disabled={bekliyor || !!yerelHata || !slug}
                className="rounded-xl bg-gece px-4 py-2.5 text-sm font-semibold text-white hover:bg-derin disabled:opacity-40"
              >
                Yeni adresi kaydet
              </button>
            )}
            <a
              href={adres}
              target="_blank"
              rel="noreferrer"
              className="rounded-xl bg-gece px-4 py-2.5 text-sm font-semibold text-white hover:bg-derin"
            >
              Siteyi aç ↗
            </a>
            <button
              onClick={async () => {
                await navigator.clipboard.writeText(adres);
                setMesaj({ tur: "basari", metin: "Bağlantı kopyalandı." });
              }}
              className="rounded-xl border border-cizgi bg-white px-4 py-2.5 text-sm font-semibold hover:bg-zemin"
            >
              🔗 Bağlantıyı kopyala
            </button>
            <button
              onClick={() => kaydet(false)}
              disabled={bekliyor}
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-40"
            >
              Yayından kaldır
            </button>
          </>
        )}
      </div>
    </div>
  );
}
