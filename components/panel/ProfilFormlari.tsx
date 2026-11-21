// ─────────────────────────────────────────────────────────────
// ProfilFormlari.tsx — Profil sayfasındaki formlar
// Kişisel bilgiler · Şifre değiştir · Diğer cihazlardan çıkış · Hesabı sil
// ─────────────────────────────────────────────────────────────
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const girdi =
  "w-full rounded-xl border border-cizgi bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-deniz focus:ring-4 focus:ring-nane disabled:bg-zemin disabled:text-derin/60";

type Mesaj = { tur: "basari" | "hata"; metin: string } | null;

function Bildirim({ mesaj }: { mesaj: Mesaj }) {
  if (!mesaj) return null;
  return (
    <p className={`rounded-lg px-3 py-2 text-sm ${mesaj.tur === "basari" ? "bg-nane text-derin" : "bg-rose-50 text-rose-700"}`}>
      {mesaj.tur === "basari" ? "✓ " : "⚠️ "}
      {mesaj.metin}
    </p>
  );
}

async function gonder(url: string, method: string, govde?: object) {
  const yanit = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: govde ? JSON.stringify(govde) : undefined,
  });
  const sonuc = await yanit.json().catch(() => ({}));
  return { ok: yanit.ok, sonuc };
}

export function KisiselBilgiler({ ad, eposta }: { ad: string; eposta: string }) {
  const router = useRouter();
  const [yeniAd, setYeniAd] = useState(ad);
  const [mesaj, setMesaj] = useState<Mesaj>(null);
  const [bekliyor, setBekliyor] = useState(false);

  async function kaydet(e: React.FormEvent) {
    e.preventDefault();
    setBekliyor(true);
    const { ok, sonuc } = await gonder("/api/profil", "PATCH", { ad: yeniAd });
    setBekliyor(false);
    setMesaj(ok ? { tur: "basari", metin: "Bilgilerin güncellendi." } : { tur: "hata", metin: sonuc.hata });
    if (ok) router.refresh(); // üst menüdeki ad da güncellensin
  }

  return (
    <form onSubmit={kaydet} className="space-y-4">
      <label className="block">
        <span className="text-sm font-medium">Ad soyad</span>
        <input value={yeniAd} onChange={(e) => setYeniAd(e.target.value)} maxLength={60} className={`${girdi} mt-1.5`} />
      </label>
      <label className="block">
        <span className="text-sm font-medium">E-posta</span>
        <input value={eposta} disabled className={`${girdi} mt-1.5`} />
        <span className="mt-1 block text-xs text-derin/60">E-posta değişikliği, doğrulama sistemi eklendiğinde açılacak.</span>
      </label>
      <Bildirim mesaj={mesaj} />
      <button
        disabled={bekliyor || yeniAd.trim() === ad}
        className="rounded-xl bg-gece px-5 py-2.5 text-sm font-semibold text-white hover:bg-derin disabled:opacity-40"
      >
        {bekliyor ? "Kaydediliyor…" : "Kaydet"}
      </button>
    </form>
  );
}

export function SifreDegistir() {
  const [f, setF] = useState({ mevcut: "", yeni: "", tekrar: "" });
  const [mesaj, setMesaj] = useState<Mesaj>(null);
  const [bekliyor, setBekliyor] = useState(false);

  async function kaydet(e: React.FormEvent) {
    e.preventDefault();
    if (f.yeni !== f.tekrar) return setMesaj({ tur: "hata", metin: "Yeni şifreler birbiriyle aynı değil." });
    setBekliyor(true);
    const { ok, sonuc } = await gonder("/api/profil/sifre", "POST", { mevcut: f.mevcut, yeni: f.yeni });
    setBekliyor(false);
    if (!ok) return setMesaj({ tur: "hata", metin: sonuc.hata });
    setF({ mevcut: "", yeni: "", tekrar: "" });
    setMesaj({
      tur: "basari",
      metin:
        sonuc.kapananOturum > 0
          ? `Şifren değişti. Güvenliğin için ${sonuc.kapananOturum} başka cihazdaki oturum kapatıldı.`
          : "Şifren değişti.",
    });
  }

  const alan = (k: keyof typeof f, etiket: string, auto: string) => (
    <label className="block">
      <span className="text-sm font-medium">{etiket}</span>
      <input
        type="password"
        value={f[k]}
        onChange={(e) => setF({ ...f, [k]: e.target.value })}
        autoComplete={auto}
        required
        minLength={k === "mevcut" ? undefined : 8}
        className={`${girdi} mt-1.5`}
      />
    </label>
  );

  return (
    <form onSubmit={kaydet} className="space-y-4">
      {alan("mevcut", "Mevcut şifre", "current-password")}
      <div className="grid gap-4 sm:grid-cols-2">
        {alan("yeni", "Yeni şifre (en az 8 karakter)", "new-password")}
        {alan("tekrar", "Yeni şifre (tekrar)", "new-password")}
      </div>
      <Bildirim mesaj={mesaj} />
      <button disabled={bekliyor} className="rounded-xl bg-gece px-5 py-2.5 text-sm font-semibold text-white hover:bg-derin disabled:opacity-40">
        {bekliyor ? "Değiştiriliyor…" : "Şifreyi değiştir"}
      </button>
    </form>
  );
}

export function DigerCihazlar() {
  const [mesaj, setMesaj] = useState<Mesaj>(null);
  const [bekliyor, setBekliyor] = useState(false);
  return (
    <div className="space-y-3">
      <button
        onClick={async () => {
          setBekliyor(true);
          const { ok, sonuc } = await gonder("/api/profil/oturumlar", "DELETE");
          setBekliyor(false);
          setMesaj(
            ok
              ? { tur: "basari", metin: sonuc.kapananOturum > 0 ? `${sonuc.kapananOturum} cihazdan çıkış yapıldı.` : "Başka açık oturum yoktu." }
              : { tur: "hata", metin: sonuc.hata },
          );
        }}
        disabled={bekliyor}
        className="rounded-xl border border-cizgi bg-white/60 px-4 py-2.5 text-sm font-semibold hover:bg-nane/50 disabled:opacity-40"
      >
        {bekliyor ? "Çıkış yapılıyor…" : "Diğer tüm cihazlardan çıkış yap"}
      </button>
      <Bildirim mesaj={mesaj} />
    </div>
  );
}

export function HesabiSil() {
  const router = useRouter();
  const [acik, setAcik] = useState(false);
  const [sifre, setSifre] = useState("");
  const [onay, setOnay] = useState("");
  const [mesaj, setMesaj] = useState<Mesaj>(null);
  const [bekliyor, setBekliyor] = useState(false);

  if (!acik)
    return (
      <button onClick={() => setAcik(true)} className="rounded-xl border border-rose-300 px-4 py-2.5 text-sm font-semibold text-rose-700 hover:bg-rose-50">
        Hesabımı sil
      </button>
    );

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setBekliyor(true);
        const { ok, sonuc } = await gonder("/api/profil", "DELETE", { sifre, onay });
        if (!ok) {
          setBekliyor(false);
          return setMesaj({ tur: "hata", metin: sonuc.hata });
        }
        router.push("/");
        router.refresh();
      }}
      className="space-y-3 rounded-xl border border-rose-200 bg-rose-50/60 p-4"
    >
      <p className="text-sm text-rose-800">
        Hesabın, tüm sitelerin ve sohbet geçmişin <strong>kalıcı olarak</strong> silinecek. Bu işlem geri alınamaz.
      </p>
      <input type="password" value={sifre} onChange={(e) => setSifre(e.target.value)} placeholder="Şifren" required autoComplete="current-password" className={girdi} />
      <input value={onay} onChange={(e) => setOnay(e.target.value)} placeholder="Onaylamak için SİL yaz" required className={girdi} />
      <Bildirim mesaj={mesaj} />
      <div className="flex gap-2">
        <button type="button" onClick={() => setAcik(false)} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-derin hover:bg-white">
          Vazgeç
        </button>
        <button
          disabled={bekliyor || onay !== "SİL"}
          className="rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-40"
        >
          {bekliyor ? "Siliniyor…" : "Hesabımı kalıcı olarak sil"}
        </button>
      </div>
    </form>
  );
}
