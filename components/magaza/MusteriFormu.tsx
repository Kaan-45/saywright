// ─────────────────────────────────────────────────────────────
// MusteriFormu.tsx — Mağaza müşterisi kayıt / giriş formu
// Mağazanın kendi renkleriyle çizilir; Saywright değil, mağaza markası görünür.
// ─────────────────────────────────────────────────────────────
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function MusteriFormu({
  tur,
  slug,
  magazaAdi,
  renk,
  devam,
}: {
  devam?: "odeme"; // girişten sonra ödeme sayfasına dönülsün mü?
  tur: "kayit" | "giris";
  slug: string;
  magazaAdi: string;
  renk: { ana: string; acik: string };
}) {
  const router = useRouter();
  const kayitMi = tur === "kayit";
  const [hata, setHata] = useState("");
  const [bekliyor, setBekliyor] = useState(false);
  const [kvkk, setKvkk] = useState(false);

  async function gonder(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setHata("");
    setBekliyor(true);
    const veri = Object.fromEntries(new FormData(e.currentTarget));
    try {
      const yanit = await fetch(`/m/${slug}/api/${kayitMi ? "kayit" : "giris"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...veri, kvkk }),
      });
      const sonuc = await yanit.json();
      if (!yanit.ok) throw new Error(sonuc.hata);
      router.push(`/m/${slug}/${devam === "odeme" ? "odeme" : "hesabim"}`);
      router.refresh();
    } catch (err) {
      setHata(err instanceof Error && err.message ? err.message : "Bir şeyler ters gitti.");
      setBekliyor(false);
    }
  }

  const kutu =
    "mt-1.5 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-zinc-500";

  return (
    <div className="rounded-3xl bg-white p-7 shadow-xl shadow-black/5 ring-1 ring-black/5">
      {/* Mağaza adına ek getirmiyoruz ("…'a"): Türkçede ek, ismin son harfine göre değişir */}
      <h1 className="text-2xl font-bold tracking-tight">{kayitMi ? "Üye ol" : "Tekrar hoş geldin"}</h1>
      <p className="mt-1 text-sm text-zinc-500">
        {kayitMi
          ? `${magazaAdi} üyeliğiyle siparişlerini takip et, kampanyalardan ilk sen haberdar ol.`
          : `${magazaAdi} hesabınla giriş yap.`}
      </p>

      <form onSubmit={gonder} className="mt-7 space-y-4">
        {kayitMi && (
          <label className="block">
            <span className="text-sm font-medium">Ad soyad</span>
            <input name="ad" required minLength={2} maxLength={60} autoComplete="name" className={kutu} />
          </label>
        )}
        <label className="block">
          <span className="text-sm font-medium">E-posta</span>
          <input name="eposta" type="email" required autoComplete="email" className={kutu} />
        </label>
        {kayitMi && (
          <label className="block">
            <span className="text-sm font-medium">
              Telefon <span className="font-normal text-zinc-400">(isteğe bağlı)</span>
            </span>
            <input name="telefon" type="tel" maxLength={20} autoComplete="tel" placeholder="05xx xxx xx xx" className={kutu} />
          </label>
        )}
        <label className="block">
          <span className="text-sm font-medium">Şifre</span>
          <input
            name="sifre"
            type="password"
            required
            minLength={kayitMi ? 8 : undefined}
            autoComplete={kayitMi ? "new-password" : "current-password"}
            placeholder={kayitMi ? "En az 8 karakter" : undefined}
            className={kutu}
          />
        </label>

        {kayitMi && (
          <label className="flex cursor-pointer items-start gap-3 rounded-xl p-3 text-sm" style={{ background: renk.acik }}>
            <input
              type="checkbox"
              checked={kvkk}
              onChange={(e) => setKvkk(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0"
              style={{ accentColor: renk.ana }}
            />
            <span className="text-zinc-700">
              <Link href={`/m/${slug}/kvkk`} target="_blank" className="font-semibold underline" style={{ color: renk.ana }}>
                KVKK Aydınlatma Metni
              </Link>
              &apos;ni okudum; kişisel verilerimin üyelik ve sipariş işlemleri için işlenmesini kabul ediyorum.
            </span>
          </label>
        )}

        {hata && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{hata}</p>}

        <button
          disabled={bekliyor || (kayitMi && !kvkk)}
          className="w-full rounded-xl py-3 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-40"
          style={{ background: renk.ana }}
        >
          {bekliyor ? "Lütfen bekle…" : kayitMi ? "Üye ol" : "Giriş yap"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-zinc-500">
        {kayitMi ? "Zaten üye misin? " : "Hesabın yok mu? "}
        <Link href={`/m/${slug}/${kayitMi ? "giris" : "kayit"}${devam ? `?devam=${devam}` : ""}`} className="font-semibold hover:underline" style={{ color: renk.ana }}>
          {kayitMi ? "Giriş yap" : "Hemen üye ol"}
        </Link>
      </p>
    </div>
  );
}
