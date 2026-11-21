// Paneldeki tıklanabilir butonlar (tarayıcıda çalışmaları gerektiği için ayrı dosyada)
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/** Yeni site oluşturur ve sohbet ekranına götürür. "istek" verilirse sohbet kutusu onunla dolu açılır. */
function useSiteOlustur() {
  const router = useRouter();
  const [bekliyor, setBekliyor] = useState(false);
  const [hata, setHata] = useState("");

  async function olustur(istek?: string) {
    setBekliyor(true);
    setHata("");
    try {
      const yanit = await fetch("/api/siteler", { method: "POST" });
      const sonuc = await yanit.json();
      if (!yanit.ok) throw new Error(sonuc.hata ?? "Site oluşturulamadı.");
      const ek = istek?.trim() ? `?istek=${encodeURIComponent(istek.trim())}` : "";
      router.push(`/olustur/${sonuc.id}${ek}`);
      // Not: sayfa değişene kadar buton "Oluşturuluyor…" kalır; bu normal.
    } catch (e) {
      setHata(e instanceof Error ? e.message : "Bir şeyler ters gitti.");
      setBekliyor(false);
    }
  }
  return { olustur, bekliyor, hata };
}

export function YeniSiteButonu({ hakVar, kucuk = false }: { hakVar: boolean; kucuk?: boolean }) {
  const { olustur, bekliyor, hata } = useSiteOlustur();
  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={() => olustur()}
        disabled={!hakVar || bekliyor}
        title={hakVar ? undefined : "Site hakkın doldu"}
        className={`rounded-xl bg-gece font-semibold text-white shadow-lg shadow-gece/20 transition hover:bg-derin disabled:cursor-not-allowed disabled:bg-cizgi disabled:text-derin/60 disabled:shadow-none ${
          kucuk ? "px-3.5 py-2 text-xs" : "px-5 py-2.5 text-sm"
        }`}
      >
        {bekliyor ? "Oluşturuluyor…" : "+ Yeni site"}
      </button>
      {hata && <p className="text-xs text-red-600">{hata}</p>}
    </div>
  );
}

/** Genel bakış sayfasındaki "hemen anlat" kutusu */
export function HizliBaslat({ hakVar }: { hakVar: boolean }) {
  const { olustur, bekliyor, hata } = useSiteOlustur();
  const [istek, setIstek] = useState("");
  const ornekler = ["El yapımı mum satıyorum", "Vintage giyim mağazası", "Organik bal ve reçel"];

  return (
    <div>
      <div className="flex flex-col gap-2 rounded-2xl bg-white/10 p-2 sm:flex-row">
        <input
          value={istek}
          onChange={(e) => setIstek(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && hakVar && !bekliyor) olustur(istek);
          }}
          maxLength={1000}
          disabled={!hakVar}
          placeholder={hakVar ? "Nasıl bir site istiyorsun? Örn: El yapımı mum satıyorum…" : "Site hakkın doldu"}
          className="flex-1 rounded-xl bg-white px-4 py-3 text-sm text-gece outline-none placeholder:text-derin/50 disabled:bg-white/70"
        />
        <button
          onClick={() => olustur(istek)}
          disabled={!hakVar || bekliyor}
          className="rounded-xl bg-nane px-5 py-3 text-sm font-bold text-gece transition hover:bg-white disabled:opacity-50"
        >
          {bekliyor ? "Hazırlanıyor…" : "Başla →"}
        </button>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {ornekler.map((o) => (
          <button
            key={o}
            onClick={() => setIstek(o)}
            className="rounded-full border border-white/20 px-3 py-1 text-xs text-white/80 hover:bg-white/10"
          >
            {o}
          </button>
        ))}
      </div>
      {hata && <p className="mt-2 text-sm text-rose-300">{hata}</p>}
    </div>
  );
}

export function CikisButonu({ className = "text-sm text-derin hover:text-gece" }: { className?: string }) {
  const router = useRouter();
  return (
    <button
      onClick={async () => {
        await fetch("/api/cikis", { method: "POST" });
        router.push("/");
        router.refresh();
      }}
      className={className}
    >
      Çıkış yap
    </button>
  );
}
