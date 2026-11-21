// ─────────────────────────────────────────────────────────────
// DogrulamaUyarisi.tsx — E-postası doğrulanmamış kullanıcılara panelin üstünde çıkan uyarı
// "Linki tekrar gönder" butonu ve (sadece geliştirmede) doğrudan doğrulama linki.
// ─────────────────────────────────────────────────────────────
"use client";

import { useState, useSyncExternalStore } from "react";

const ANAHTAR = "gelistirmeDogrulamaLinki";
const oku = () => {
  try {
    return sessionStorage.getItem(ANAHTAR);
  } catch {
    return null;
  }
};

export default function DogrulamaUyarisi({ eposta }: { eposta: string }) {
  // Kayıt sırasında gelen geliştirme linki (e-posta servisi yokken)
  const kayittanGelen = useSyncExternalStore(
    () => () => {},
    oku,
    () => null,
  );
  const [yeniLink, setYeniLink] = useState<string | null>(null);
  const [mesaj, setMesaj] = useState<{ tur: "basari" | "hata"; metin: string } | null>(null);
  const [bekliyor, setBekliyor] = useState(false);
  const gelistirmeLinki = yeniLink ?? kayittanGelen;

  async function tekrarGonder() {
    setBekliyor(true);
    setMesaj(null);
    try {
      const y = await fetch("/api/eposta-dogrula", { method: "POST" });
      const s = await y.json().catch(() => ({}));
      if (!y.ok) return setMesaj({ tur: "hata", metin: s.hata ?? "Gönderilemedi." });
      if (s.gelistirmeLinki) setYeniLink(s.gelistirmeLinki);
      setMesaj({ tur: "basari", metin: s.gelistirmeLinki ? "Yeni link hazır (aşağıda)." : `Yeni link ${s.eposta} adresine gönderildi.` });
    } catch {
      setMesaj({ tur: "hata", metin: "Sunucuya ulaşılamadı." });
    } finally {
      setBekliyor(false);
    }
  }

  return (
    <div className="border-b border-amber-300 bg-amber-50">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 text-sm sm:px-6">
        <p className="flex-1 text-amber-900">
          📧 <b>E-posta adresini doğrula.</b> <span className="break-all">{eposta}</span> adresine bir link gönderdik. Doğrulayana kadar yeni site
          oluşturamaz ve yapay zekaya mesaj gönderemezsin.
        </p>
        <button
          onClick={tekrarGonder}
          disabled={bekliyor}
          className="rounded-lg border border-amber-400 bg-white px-3 py-1.5 text-xs font-semibold text-amber-900 hover:bg-amber-100 disabled:opacity-50"
        >
          {bekliyor ? "Gönderiliyor…" : "Linki tekrar gönder"}
        </button>
        {mesaj && <p className={`w-full text-xs ${mesaj.tur === "basari" ? "text-emerald-700" : "text-rose-700"}`}>{mesaj.metin}</p>}
        {gelistirmeLinki && (
          <p className="w-full rounded-lg border border-dashed border-amber-400 bg-white px-3 py-2 text-xs text-amber-900">
            🧪 Geliştirme modu: e-posta servisi (RESEND_API_KEY) bağlı olmadığı için e-posta gönderilmedi.{" "}
            <a href={gelistirmeLinki} className="font-semibold underline">
              Doğrulama linkini aç →
            </a>
          </p>
        )}
      </div>
    </div>
  );
}
