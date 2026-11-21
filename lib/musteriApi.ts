// Mağaza müşteri API'lerinin ortak yardımcıları
import { yayindakiMagaza } from "./magazalar";
import { mevcutMusteri } from "./musteriler";

export const hata = (mesaj: string, durum: number) => Response.json({ hata: mesaj }, { status: durum });

export const epostaGecerli = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

/** Telefonu sadeleştirir: boşsa null; değilse rakam/boşluk/+()- dışındakileri kabul etmez. */
export function telefonTemizle(t: unknown): string | null | false {
  const s = String(t ?? "").trim();
  if (!s) return null;
  if (!/^[0-9 +()-]{7,20}$/.test(s)) return false;
  return s;
}

/** Adresten yayındaki mağazayı bulur. Yoksa hata cevabı döner. */
export async function magazayiBul(ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const magaza = await yayindakiMagaza(slug);
  if (!magaza) return { yanit: hata("Mağaza bulunamadı.", 404) } as const;
  return { slug, magaza } as const;
}

/** Mağaza + giriş yapmış müşteri. Giriş yoksa hata cevabı döner. */
export async function musteriyiBul(ctx: { params: Promise<{ slug: string }> }) {
  const m = await magazayiBul(ctx);
  if ("yanit" in m) return { yanit: m.yanit } as const;
  const musteri = await mevcutMusteri(m.magaza.id);
  if (!musteri) return { yanit: hata("Oturumun kapanmış, tekrar giriş yap.", 401) } as const;
  return { ...m, musteri } as const;
}
