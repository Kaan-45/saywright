// ─────────────────────────────────────────────────────────────
// OdemeFormu.tsx — Siparişi tamamlama: teslimat adresi + ödeme yöntemi + özet
// ─────────────────────────────────────────────────────────────
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { sepetiBosalt } from "@/lib/sepetIstemci";
import { ODEME_YONTEMLERI, tlYaz, tutarlariHesapla, type OdemeYontemi } from "@/lib/siparis";
import type { Urun } from "@/templates/magaza/tipler";
import { useSepet } from "./SepetBilesenleri";
import { sepetSatirlari } from "./SepetSayfasi";

const kutu = "mt-1.5 w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-zinc-500";

export default function OdemeFormu({
  slug,
  urunler,
  renk,
  varsayilan,
}: {
  slug: string;
  urunler: Urun[];
  renk: { ana: string; acik: string };
  varsayilan: { adSoyad: string; telefon: string };
}) {
  const router = useRouter();
  const sepet = useSepet(slug);
  const satirlar = sepetSatirlari(sepet, urunler).filter((s) => s.urun && !s.sorun);
  const t = tutarlariHesapla(satirlar);
  const [f, setF] = useState({ ...varsayilan, il: "", ilce: "", adres: "", not: "" });
  const [odeme, setOdeme] = useState<OdemeYontemi>("kapida");
  const [hata, setHata] = useState("");
  const [bekliyor, setBekliyor] = useState(false);
  const [tamamlandi, setTamamlandi] = useState(false);

  const alan = (k: keyof typeof f, etiket: string, ek: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <label className="block text-sm font-medium">
      {etiket}
      <input value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} className={kutu} {...ek} />
    </label>
  );

  async function gonder(e: React.FormEvent) {
    e.preventDefault();
    setHata("");
    setBekliyor(true);
    try {
      const y = await fetch(`/m/${slug}/api/siparis`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kalemler: satirlar.map((s) => ({ ad: s.ad, adet: s.adet })),
          teslimat: f,
          odemeYontemi: odeme,
        }),
      });
      const sonuc = await y.json();
      if (!y.ok) throw new Error(sonuc.hata);
      setTamamlandi(true); // sepet boşalınca "sepet boş" ekranı görünmesin
      sepetiBosalt(slug);
      router.push(`/m/${slug}/siparis/${sonuc.kod}?yeni=1`);
    } catch (err) {
      setHata(err instanceof Error && err.message ? err.message : "Sipariş verilemedi, tekrar dene.");
      setBekliyor(false);
    }
  }

  if (tamamlandi) return <p className="py-20 text-center text-zinc-500">Siparişin oluşturuldu, yönlendiriliyorsun…</p>;

  if (satirlar.length === 0)
    return (
      <div className="rounded-3xl bg-white p-12 text-center shadow-sm ring-1 ring-black/5">
        <p className="text-5xl">🛒</p>
        <p className="mt-4 font-semibold">Sepetinde sipariş verilebilecek ürün yok.</p>
        <Link href={`/m/${slug}/sepet`} className="mt-6 inline-block rounded-xl px-6 py-3 text-sm font-bold text-white" style={{ background: renk.ana }}>
          Sepete dön
        </Link>
      </div>
    );

  return (
    <form onSubmit={gonder} className="grid gap-6 md:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5">
          <h2 className="text-lg font-bold">📍 Teslimat adresi</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {alan("adSoyad", "Alıcı ad soyad", { required: true, minLength: 2, maxLength: 80, autoComplete: "name" })}
            {alan("telefon", "Telefon", { required: true, type: "tel", maxLength: 20, autoComplete: "tel", placeholder: "05xx xxx xx xx" })}
            {alan("il", "İl", { required: true, maxLength: 40, autoComplete: "address-level1" })}
            {alan("ilce", "İlçe", { required: true, maxLength: 40, autoComplete: "address-level2" })}
          </div>
          <label className="mt-4 block text-sm font-medium">
            Açık adres
            <textarea
              value={f.adres}
              onChange={(e) => setF({ ...f, adres: e.target.value })}
              required
              minLength={10}
              maxLength={300}
              rows={3}
              autoComplete="street-address"
              placeholder="Mahalle, sokak, bina no, daire no"
              className={kutu}
            />
          </label>
          <div className="mt-4">{alan("not", "Sipariş notu (isteğe bağlı)", { maxLength: 300, placeholder: "Örn: Kapıcıya bırakabilirsiniz" })}</div>
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5">
          <h2 className="text-lg font-bold">💳 Ödeme yöntemi</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {(Object.keys(ODEME_YONTEMLERI) as OdemeYontemi[]).map((k) => (
              <label
                key={k}
                className="flex cursor-pointer gap-3 rounded-2xl border-2 p-4 transition"
                style={odeme === k ? { borderColor: renk.ana, background: renk.acik } : { borderColor: "#e4e4e7" }}
              >
                <input type="radio" name="odeme" checked={odeme === k} onChange={() => setOdeme(k)} className="mt-1" style={{ accentColor: renk.ana }} />
                <span>
                  <span className="block font-semibold">{ODEME_YONTEMLERI[k].ad}</span>
                  <span className="text-xs text-zinc-500">{ODEME_YONTEMLERI[k].aciklama}</span>
                </span>
              </label>
            ))}
          </div>
          <p className="mt-3 text-xs text-zinc-400">Kartla online ödeme çok yakında.</p>
        </section>
      </div>

      <aside className="h-fit space-y-4 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5 md:sticky md:top-6">
        <h2 className="font-bold">Sipariş özeti</h2>
        <ul className="space-y-2 text-sm">
          {satirlar.map((s) => (
            <li key={s.ad} className="flex justify-between gap-2">
              <span className="truncate">
                {s.urun?.emoji} {s.ad} <span className="text-zinc-400">× {s.adet}</span>
              </span>
              <span className="shrink-0">{tlYaz(s.birimKurus * s.adet)}</span>
            </li>
          ))}
        </ul>
        <div className="space-y-1.5 border-t border-zinc-100 pt-3 text-sm">
          <p className="flex justify-between"><span className="text-zinc-500">Ara toplam</span>{tlYaz(t.araToplam)}</p>
          <p className="flex justify-between"><span className="text-zinc-500">Kargo</span>{t.kargo === 0 ? "Bedava" : tlYaz(t.kargo)}</p>
          <p className="flex justify-between pt-1 text-base font-bold"><span>Toplam</span><span style={{ color: renk.ana }}>{tlYaz(t.toplam)}</span></p>
        </div>
        {hata && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{hata}</p>}
        <button disabled={bekliyor} className="w-full rounded-xl py-3 text-sm font-bold text-white hover:opacity-90 disabled:opacity-50" style={{ background: renk.ana }}>
          {bekliyor ? "Sipariş veriliyor…" : "Siparişi onayla"}
        </button>
        <p className="text-center text-[11px] text-zinc-400">
          “Siparişi onayla”ya basarak{" "}
          <Link href={`/m/${slug}/kvkk`} target="_blank" className="underline">
            aydınlatma metnini
          </Link>{" "}
          okuduğunu kabul edersin.
        </p>
      </aside>
    </form>
  );
}
