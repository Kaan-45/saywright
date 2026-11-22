// ─────────────────────────────────────────────────────────────
// MisafirButonu.tsx — "🎟️ Misafir olarak dene" (sadece demo modunda gösterilir)
// Tıklayınca geçici hesap açılır ve doğrudan site oluşturma ekranına gidilir.
// ─────────────────────────────────────────────────────────────
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function MisafirButonu({ className = "", etiket = "🎟️ Misafir olarak dene" }: { className?: string; etiket?: string }) {
  const router = useRouter();
  const [bekliyor, setBekliyor] = useState(false);
  const [hata, setHata] = useState<string | null>(null);

  async function basla() {
    setBekliyor(true);
    setHata(null);
    try {
      const yanit = await fetch("/api/misafir", { method: "POST" });
      const cevap = await yanit.json();
      if (!yanit.ok) return setHata(cevap.hata);
      router.push(cevap.siteId ? `/olustur/${cevap.siteId}` : "/panel");
      router.refresh();
    } catch {
      setHata("Sunucuya ulaşılamadı.");
    } finally {
      setBekliyor(false);
    }
  }

  return (
    <div className="flex flex-col items-center">
      <button type="button" onClick={basla} disabled={bekliyor} className={`disabled:cursor-wait disabled:opacity-60 ${className}`}>
        {bekliyor ? "Hazırlanıyor…" : etiket}
      </button>
      {hata && (
        <p className="mt-2 text-xs text-red-600" role="alert">
          {hata}
        </p>
      )}
    </div>
  );
}
