// Bir siparişin içeriği: ürünler, tutarlar, teslimat ve ödeme bilgisi.
// Hem müşterinin onay sayfasında hem mağaza sahibinin admin panelinde kullanılır.
import { DURUMLAR, ODEME_YONTEMLERI, tlYaz, type Siparis, type SiparisDurumu } from "@/lib/siparis";

export function DurumRozeti({ durum }: { durum: SiparisDurumu }) {
  const d = DURUMLAR[durum];
  return (
    <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${d.renk}`}>
      {d.ikon} {d.ad}
    </span>
  );
}

const ADIMLAR: SiparisDurumu[] = ["yeni", "hazirlaniyor", "kargoda", "teslim"];

/** Sipariş yolculuğu: Alındı → Hazırlanıyor → Kargoda → Teslim edildi */
export function DurumCizgisi({ durum, renk = "#131B2B" }: { durum: SiparisDurumu; renk?: string }) {
  if (durum === "iptal") return <p className="rounded-xl bg-zinc-100 p-3 text-sm text-zinc-600">✖ Bu sipariş iptal edildi.</p>;
  const sira = ADIMLAR.indexOf(durum);
  return (
    <ol className="grid grid-cols-4 gap-2">
      {ADIMLAR.map((a, i) => (
        <li key={a} className="text-center">
          <div className="h-1.5 rounded-full" style={{ background: i <= sira ? renk : "#e4e4e7" }} />
          <p className={`mt-2 text-[11px] ${i <= sira ? "font-semibold text-zinc-900" : "text-zinc-400"}`}>
            {a === "yeni" ? "Alındı" : DURUMLAR[a].ad}
          </p>
        </li>
      ))}
    </ol>
  );
}

export default function SiparisDetayi({ siparis }: { siparis: Siparis }) {
  const t = siparis.teslimat;
  return (
    <div className="space-y-5 text-sm">
      <ul className="divide-y divide-zinc-100">
        {siparis.kalemler.map((k) => (
          <li key={k.ad} className="flex items-center justify-between gap-3 py-2.5">
            <span>
              <span className="mr-2 text-lg">{k.emoji}</span>
              {k.ad} <span className="text-zinc-400">× {k.adet}</span>
            </span>
            <span className="shrink-0 font-medium">{tlYaz(k.birimKurus * k.adet)}</span>
          </li>
        ))}
      </ul>
      <div className="space-y-1 border-t border-zinc-100 pt-3">
        <p className="flex justify-between text-zinc-500"><span>Ara toplam</span>{tlYaz(siparis.araToplamKurus)}</p>
        <p className="flex justify-between text-zinc-500"><span>Kargo</span>{siparis.kargoKurus === 0 ? "Bedava" : tlYaz(siparis.kargoKurus)}</p>
        <p className="flex justify-between pt-1 text-base font-bold"><span>Toplam</span>{tlYaz(siparis.toplamKurus)}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl bg-zinc-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Teslimat</p>
          <p className="mt-1 font-semibold">{t.adSoyad}</p>
          <p className="text-zinc-600">{t.telefon}</p>
          <p className="mt-1 text-zinc-600">
            {t.adres}, {t.ilce} / {t.il}
          </p>
          {t.not && <p className="mt-2 text-xs italic text-zinc-500">Not: {t.not}</p>}
        </div>
        <div className="rounded-xl bg-zinc-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Ödeme</p>
          <p className="mt-1 font-semibold">{ODEME_YONTEMLERI[siparis.odemeYontemi].ad}</p>
          <p className="text-zinc-600">{ODEME_YONTEMLERI[siparis.odemeYontemi].aciklama}</p>
          {siparis.kargoTakip && <p className="mt-2 text-zinc-600">🚚 Kargo takip no: <strong>{siparis.kargoTakip}</strong></p>}
        </div>
      </div>
    </div>
  );
}
