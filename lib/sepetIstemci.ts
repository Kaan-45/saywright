// ─────────────────────────────────────────────────────────────
// sepetIstemci.ts — Sepet (TARAYICIDA çalışır)
//
// Sepet, ziyaretçinin kendi tarayıcısında (localStorage) tutulur; giriş yapmadan da
// ürün eklenebilsin diye. Her mağazanın sepeti ayrıdır: anahtar "sepet:<adres>".
// Sepette sadece ürün adı ve adet var; FİYAT sipariş anında sunucuda hesaplanır.
// ─────────────────────────────────────────────────────────────

export type SepetKalemi = { ad: string; adet: number };

const anahtar = (slug: string) => `sepet:${slug}`;
const OLAY = "sepet-degisti";
const BOS: SepetKalemi[] = [];
const onbellek = new Map<string, { ham: string | null; deger: SepetKalemi[] }>();

/** Sepeti okur. (Aynı veri için hep aynı diziyi döndürür; React gereksiz yere yeniden çizmesin.) */
export function sepetiOku(slug: string): SepetKalemi[] {
  let ham: string | null = null;
  try {
    ham = localStorage.getItem(anahtar(slug));
  } catch {
    return BOS; // gizli sekme vb. durumlarda localStorage kapalı olabilir
  }
  const eski = onbellek.get(slug);
  if (eski && eski.ham === ham) return eski.deger;
  let deger = BOS;
  try {
    const d = JSON.parse(ham ?? "[]");
    if (Array.isArray(d)) deger = d.filter((k) => typeof k?.ad === "string" && Number.isInteger(k?.adet) && k.adet > 0);
  } catch {}
  onbellek.set(slug, { ham, deger });
  return deger;
}

export function sepetiYaz(slug: string, kalemler: SepetKalemi[]) {
  try {
    localStorage.setItem(anahtar(slug), JSON.stringify(kalemler.filter((k) => k.adet > 0)));
  } catch {}
  window.dispatchEvent(new Event(OLAY));
}

export function sepeteEkle(slug: string, ad: string, adet = 1) {
  const s = sepetiOku(slug);
  const var_ = s.find((k) => k.ad === ad);
  sepetiYaz(slug, var_ ? s.map((k) => (k.ad === ad ? { ...k, adet: Math.min(20, k.adet + adet) } : k)) : [...s, { ad, adet }]);
}

export const sepetiBosalt = (slug: string) => sepetiYaz(slug, []);

/** useSyncExternalStore için: sepet değişince (bu sekmede veya başka sekmede) haber ver */
export function sepetiDinle(cb: () => void) {
  window.addEventListener(OLAY, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(OLAY, cb);
    window.removeEventListener("storage", cb);
  };
}
