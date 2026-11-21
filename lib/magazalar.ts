// ─────────────────────────────────────────────────────────────
// magazalar.ts — Herkese açık mağaza sayfalarının verisi
//
// "use cache": Sonuç önbellekte (hafızada) tutulur. Böylece binlerce ziyaretçi
// gelse bile veritabanına her seferinde gidilmez, sayfa çok hızlı açılır.
// cacheTag ile her mağazaya bir "etiket" veriyoruz; mağaza sahibi bir şey
// değiştirince magazaOnbellegiTemizle() o etiketi silip taze veriyi getirtir.
// ─────────────────────────────────────────────────────────────

import { and, eq } from "drizzle-orm";
import { cacheLife, cacheTag, revalidateTag } from "next/cache";
import { db } from "./db";
import { siteler } from "./db/sema";

const etiket = (slug: string) => `magaza:${slug}`;

/** Yayındaki mağazanın kimliğini ve ayarlarını getirir. Yayında değilse veya yoksa null. */
export async function yayindakiMagaza(slug: string) {
  "use cache";
  cacheTag(etiket(slug));
  cacheLife("hours"); // değişiklik olmasa bile en geç birkaç saatte bir tazelenir

  const [s] = await db
    .select({ id: siteler.id, ayarlar: siteler.ayarlar })
    .from(siteler)
    .where(and(eq(siteler.slug, slug), eq(siteler.yayinda, true)))
    .limit(1);
  return s?.ayarlar ? { id: s.id, ayarlar: s.ayarlar } : null;
}

/** Mağaza değiştiğinde çağrılır: ziyaretçiler bir sonraki açılışta güncel hali görür. */
export function magazaOnbellegiTemizle(slug: string | null | undefined) {
  if (slug) revalidateTag(etiket(slug), { expire: 0 });
}
