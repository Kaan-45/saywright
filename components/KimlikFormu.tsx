// ─────────────────────────────────────────────────────────────
// KimlikFormu.tsx — Kayıt ve giriş formu (ikisi aynı bileşen)
// ─────────────────────────────────────────────────────────────
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function KimlikFormu({ tur }: { tur: "kayit" | "giris" }) {
  const router = useRouter();
  const [hata, setHata] = useState("");
  const [bekliyor, setBekliyor] = useState(false);
  const kayitMi = tur === "kayit";

  async function gonder(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setHata("");
    setBekliyor(true);
    // FormData: formdaki tüm kutuları "name" özelliklerine göre toplar
    const veri = Object.fromEntries(new FormData(e.currentTarget));
    const yanit = await fetch(kayitMi ? "/api/kayit" : "/api/giris", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(veri),
    });
    const sonuc = await yanit.json();
    if (!yanit.ok) {
      setHata(sonuc.hata ?? "Bir şeyler ters gitti.");
      setBekliyor(false);
      return;
    }
    // Sadece geliştirmede (e-posta servisi yokken) gelir: paneldeki uyarıda gösterilsin
    if (sonuc.gelistirmeLinki) {
      try {
        sessionStorage.setItem("gelistirmeDogrulamaLinki", sonuc.gelistirmeLinki);
      } catch {}
    }
    router.push("/panel");
    router.refresh();
  }

  const kutu =
    "w-full rounded-xl border border-cizgi bg-kart px-4 py-3 text-sm outline-none transition focus:border-deniz focus:ring-4 focus:ring-nane";

  return (
    <div className="w-full max-w-sm">
      <h1 className="text-2xl font-bold tracking-tight">{kayitMi ? "Ücretsiz hesap oluştur" : "Tekrar hoş geldin"}</h1>
      <p className="mt-1 text-sm text-derin/70">
        {kayitMi ? "2 site oluşturma hakkın hediye. Kredi kartı gerekmez." : "Sitelerine devam etmek için giriş yap."}
      </p>

      <form onSubmit={gonder} className="mt-8 space-y-4">
        {kayitMi && (
          <label className="block">
            <span className="text-sm font-medium">Adın</span>
            <input name="ad" required minLength={2} autoComplete="name" className={`${kutu} mt-1`} placeholder="Ayşe Yılmaz" />
          </label>
        )}
        <label className="block">
          <span className="text-sm font-medium">E-posta</span>
          <input name="eposta" type="email" required autoComplete="email" className={`${kutu} mt-1`} placeholder="ornek@eposta.com" />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Şifre</span>
          <input
            name="sifre"
            type="password"
            required
            minLength={kayitMi ? 8 : undefined}
            autoComplete={kayitMi ? "new-password" : "current-password"}
            className={`${kutu} mt-1`}
            placeholder={kayitMi ? "En az 8 karakter" : "••••••••"}
          />
        </label>

        {hata && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{hata}</p>}

        <button
          disabled={bekliyor}
          className="w-full rounded-xl bg-gece py-3 text-sm font-semibold text-white transition hover:bg-derin disabled:opacity-50"
        >
          {bekliyor ? "Lütfen bekle…" : kayitMi ? "Hesabımı oluştur" : "Giriş yap"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-derin/70">
        {kayitMi ? "Zaten hesabın var mı? " : "Hesabın yok mu? "}
        <Link href={kayitMi ? "/giris" : "/kayit"} className="font-semibold text-deniz hover:underline">
          {kayitMi ? "Giriş yap" : "Ücretsiz kaydol"}
        </Link>
      </p>
    </div>
  );
}
