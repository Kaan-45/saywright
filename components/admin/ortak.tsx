// Süper admin sayfalarında ortak küçük parçalar
import { TALEP_DURUMLARI, type TalepDurumu } from "@/lib/yayinTalepleri";

export const tl = (kurus: number) => `${(kurus / 100).toLocaleString("tr-TR", { maximumFractionDigits: 2 })} ₺`;
export const tarih = (d: Date | string) =>
  new Date(d).toLocaleString("tr-TR", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

export function SayfaBasligi({ baslik, aciklama }: { baslik: string; aciklama: string }) {
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">{baslik}</h1>
      <p className="mt-1 text-derin/70">{aciklama}</p>
    </div>
  );
}

export function TalepRozeti({ durum }: { durum: TalepDurumu }) {
  const d = TALEP_DURUMLARI[durum];
  return <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${d.renk}`}>{d.ad}</span>;
}

export const icerik = "mx-auto max-w-6xl px-4 py-8 sm:px-8 sm:py-10";
export const dugme = "rounded-lg px-3 py-1.5 text-xs font-semibold transition disabled:opacity-40";
