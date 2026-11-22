// ─────────────────────────────────────────────────────────────
// misafir.ts — "Misafir olarak dene" (sadece demo modunda)
//
// Ziyaretçi form doldurmadan tek tıkla geçici bir hesapla girer.
//   • E-postası gerçek değil: misafir-xxxx@misafir.saywright
//   • Şifresi rastgele; kimse bu hesaba şifreyle giremez.
//   • 1 gün sonra hesap (siteleri ve oturumuyla birlikte) silinir.
// Gerçek yapay zeka açıkken (masraf var) misafir girişi kapalıdır.
// ─────────────────────────────────────────────────────────────

import { randomBytes } from "crypto";
import { and, gt, like, lt, sql } from "drizzle-orm";
import { db } from "./db";
import { kullanicilar } from "./db/sema";

const ALAN = "@misafir.saywright";
export const MISAFIR_OMRU_SAAT = 24;
const SAATLIK_SINIR = 300; // kötüye kullanıma karşı: bir saatte en fazla bu kadar misafir hesabı

export const misafirEpostasiUret = () => `misafir-${randomBytes(6).toString("hex")}${ALAN}`;
export const misafirMi = (eposta: string) => eposta.endsWith(ALAN);

/** Süresi dolmuş misafir hesaplarını siler (siteleri ve oturumları cascade ile gider). */
export async function eskiMisafirleriSil() {
  await db
    .delete(kullanicilar)
    .where(and(like(kullanicilar.eposta, `%${ALAN}`), lt(kullanicilar.kayitTarihi, sql`now() - make_interval(hours => ${MISAFIR_OMRU_SAAT})`)));
}

/** Son bir saatte açılan misafir hesabı sınırı aşıldı mı? */
export async function misafirSiniriDoluMu() {
  const [s] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(kullanicilar)
    .where(and(like(kullanicilar.eposta, `%${ALAN}`), gt(kullanicilar.kayitTarihi, sql`now() - interval '1 hour'`)));
  return (s?.n ?? 0) >= SAATLIK_SINIR;
}
