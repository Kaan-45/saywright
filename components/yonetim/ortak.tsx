// Admin panelinin parçalarında ortak kullanılan küçük yardımcılar
import type { MagazaAyarlari } from "@/templates/magaza/tipler";

/** Bir değişikliği sunucuya kaydeder; hata varsa Türkçe mesaj, yoksa null döner. */
export type KaydetFn = (yeni: MagazaAyarlari) => Promise<string | null>;

export const girdiSinifi =
  "w-full rounded-xl border border-cizgi bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-deniz focus:ring-4 focus:ring-nane";

export const tl = (n: number) => n.toLocaleString("tr-TR") + " ₺";

export function Alan({ etiket, ipucu, children }: { etiket: string; ipucu?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-gece">{etiket}</span>
      <div className="mt-1.5">{children}</div>
      {ipucu && <span className="mt-1 block text-xs text-derin/60">{ipucu}</span>}
    </label>
  );
}

export function StokRozeti({ stok }: { stok?: number }) {
  if (stok === undefined) return <span className="whitespace-nowrap rounded-full bg-zemin px-2.5 py-1 text-xs text-derin/70">Takip yok</span>;
  if (stok === 0) return <span className="whitespace-nowrap rounded-full bg-rose-100 px-2.5 py-1 text-xs font-semibold text-rose-700">Tükendi</span>;
  if (stok <= 5)
    return <span className="whitespace-nowrap rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">Az kaldı · {stok}</span>;
  return <span className="whitespace-nowrap rounded-full bg-nane px-2.5 py-1 text-xs font-semibold text-derin">Stokta · {stok}</span>;
}

/** Ekranın ortasında açılan pencere (ürün formu, silme onayı, önizleme için). */
export function Pencere({
  baslik,
  kapat,
  genis = false,
  children,
}: {
  baslik: string;
  kapat: () => void;
  genis?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gece/60 p-3 backdrop-blur-sm sm:p-6"
      onClick={kapat}
      role="dialog"
      aria-modal="true"
      aria-label={baslik}
    >
      <div
        className={`flex max-h-[90vh] w-full flex-col overflow-hidden rounded-2xl bg-kart shadow-2xl ${genis ? "h-[88vh] max-w-6xl" : "max-w-3xl"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-cizgi px-5 py-3.5">
          <h2 className="font-semibold">{baslik}</h2>
          <button
            onClick={kapat}
            className="grid h-8 w-8 place-items-center rounded-full bg-zemin text-derin hover:bg-cizgi"
            aria-label="Kapat"
          >
            ✕
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
