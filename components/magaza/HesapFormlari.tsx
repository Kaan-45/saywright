// ─────────────────────────────────────────────────────────────
// HesapFormlari.tsx — Mağaza müşterisinin "Hesabım" sayfasındaki formlar
// ─────────────────────────────────────────────────────────────
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Renk = { ana: string; acik: string };
type Mesaj = { tur: "basari" | "hata"; metin: string } | null;

const kutu = "mt-1.5 w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-zinc-500 disabled:bg-zinc-100";

async function istek(url: string, method: string, govde?: object) {
  const y = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: govde ? JSON.stringify(govde) : undefined });
  return { ok: y.ok, sonuc: await y.json().catch(() => ({})) };
}

function Bildirim({ mesaj }: { mesaj: Mesaj }) {
  if (!mesaj) return null;
  return <p className={`rounded-lg px-3 py-2 text-sm ${mesaj.tur === "basari" ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-700"}`}>{mesaj.metin}</p>;
}

export function BilgilerFormu({ slug, renk, ad, eposta, telefon }: { slug: string; renk: Renk; ad: string; eposta: string; telefon: string | null }) {
  const router = useRouter();
  const [f, setF] = useState({ ad, telefon: telefon ?? "" });
  const [mesaj, setMesaj] = useState<Mesaj>(null);
  const [bekliyor, setBekliyor] = useState(false);
  const degisti = f.ad !== ad || f.telefon !== (telefon ?? "");

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setBekliyor(true);
        const { ok, sonuc } = await istek(`/m/${slug}/api/hesap`, "PATCH", f);
        setBekliyor(false);
        setMesaj(ok ? { tur: "basari", metin: "✓ Bilgilerin güncellendi." } : { tur: "hata", metin: sonuc.hata });
        if (ok) router.refresh();
      }}
      className="space-y-4"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium">
          Ad soyad
          <input value={f.ad} onChange={(e) => setF({ ...f, ad: e.target.value })} maxLength={60} className={kutu} />
        </label>
        <label className="block text-sm font-medium">
          Telefon
          <input value={f.telefon} onChange={(e) => setF({ ...f, telefon: e.target.value })} maxLength={20} type="tel" className={kutu} />
        </label>
      </div>
      <label className="block text-sm font-medium">
        E-posta
        <input value={eposta} disabled className={kutu} />
      </label>
      <Bildirim mesaj={mesaj} />
      <button disabled={!degisti || bekliyor} className="rounded-xl px-5 py-2.5 text-sm font-bold text-white disabled:opacity-40" style={{ background: renk.ana }}>
        {bekliyor ? "Kaydediliyor…" : "Kaydet"}
      </button>
    </form>
  );
}

export function SifreFormu({ slug, renk }: { slug: string; renk: Renk }) {
  const [f, setF] = useState({ mevcut: "", yeni: "", tekrar: "" });
  const [mesaj, setMesaj] = useState<Mesaj>(null);
  const [bekliyor, setBekliyor] = useState(false);

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        if (f.yeni !== f.tekrar) return setMesaj({ tur: "hata", metin: "Yeni şifreler birbiriyle aynı değil." });
        setBekliyor(true);
        const { ok, sonuc } = await istek(`/m/${slug}/api/sifre`, "POST", { mevcut: f.mevcut, yeni: f.yeni });
        setBekliyor(false);
        if (!ok) return setMesaj({ tur: "hata", metin: sonuc.hata });
        setF({ mevcut: "", yeni: "", tekrar: "" });
        setMesaj({ tur: "basari", metin: "✓ Şifren değişti. Diğer cihazlardaki oturumların kapatıldı." });
      }}
      className="space-y-4"
    >
      <label className="block text-sm font-medium">
        Mevcut şifre
        <input type="password" required value={f.mevcut} onChange={(e) => setF({ ...f, mevcut: e.target.value })} autoComplete="current-password" className={kutu} />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium">
          Yeni şifre
          <input type="password" required minLength={8} value={f.yeni} onChange={(e) => setF({ ...f, yeni: e.target.value })} autoComplete="new-password" className={kutu} />
        </label>
        <label className="block text-sm font-medium">
          Yeni şifre (tekrar)
          <input type="password" required minLength={8} value={f.tekrar} onChange={(e) => setF({ ...f, tekrar: e.target.value })} autoComplete="new-password" className={kutu} />
        </label>
      </div>
      <Bildirim mesaj={mesaj} />
      <button disabled={bekliyor} className="rounded-xl px-5 py-2.5 text-sm font-bold text-white disabled:opacity-40" style={{ background: renk.ana }}>
        {bekliyor ? "Değiştiriliyor…" : "Şifreyi değiştir"}
      </button>
    </form>
  );
}

export function CikisYap({ slug }: { slug: string }) {
  const router = useRouter();
  return (
    <button
      onClick={async () => {
        await istek(`/m/${slug}/api/cikis`, "POST");
        router.push(`/m/${slug}`);
        router.refresh();
      }}
      className="rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold hover:bg-zinc-50"
    >
      Çıkış yap
    </button>
  );
}

export function HesabiSil({ slug }: { slug: string }) {
  const router = useRouter();
  const [acik, setAcik] = useState(false);
  const [sifre, setSifre] = useState("");
  const [onay, setOnay] = useState("");
  const [mesaj, setMesaj] = useState<Mesaj>(null);
  const [bekliyor, setBekliyor] = useState(false);

  if (!acik)
    return (
      <button onClick={() => setAcik(true)} className="text-sm font-semibold text-red-700 hover:underline">
        Hesabımı ve verilerimi sil
      </button>
    );

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setBekliyor(true);
        const { ok, sonuc } = await istek(`/m/${slug}/api/hesap`, "DELETE", { sifre, onay });
        if (!ok) {
          setBekliyor(false);
          return setMesaj({ tur: "hata", metin: sonuc.hata });
        }
        router.push(`/m/${slug}`);
        router.refresh();
      }}
      className="space-y-3 rounded-xl border border-red-200 bg-red-50/60 p-4"
    >
      <p className="text-sm text-red-800">Hesabın ve kişisel bilgilerin bu mağazadan <strong>kalıcı olarak</strong> silinecek.</p>
      <input type="password" required value={sifre} onChange={(e) => setSifre(e.target.value)} placeholder="Şifren" autoComplete="current-password" className={kutu} />
      <input required value={onay} onChange={(e) => setOnay(e.target.value)} placeholder="Onaylamak için SİL yaz" className={kutu} />
      <Bildirim mesaj={mesaj} />
      <div className="flex gap-2">
        <button type="button" onClick={() => setAcik(false)} className="rounded-xl px-4 py-2 text-sm font-semibold hover:bg-white">
          Vazgeç
        </button>
        <button disabled={bekliyor || onay !== "SİL"} className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40">
          {bekliyor ? "Siliniyor…" : "Kalıcı olarak sil"}
        </button>
      </div>
    </form>
  );
}
