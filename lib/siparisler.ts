// ─────────────────────────────────────────────────────────────
// siparisler.ts — Sipariş oluşturma, listeleme ve durum güncelleme (sunucu)
//
// En kritik kısım: sipariş verilirken stok düşmek.
// İki müşteri son ürünü AYNI ANDA almaya çalışırsa ikisi de alamamalı.
// Bunu "sürüm" (surum) numarasıyla çözüyoruz:
//   1) Mağazanın ayarlarını ve sürümünü oku
//   2) Stoğu kontrol et, yeni ayarları hesapla
//   3) TEK bir SQL komutunda: "sürüm hâlâ aynıysa ayarları güncelle VE siparişi kaydet"
//   4) Arada başka biri değiştirdiyse (sürüm değişmiş) baştan dene
// ─────────────────────────────────────────────────────────────

import { randomInt } from "crypto";
import { and, desc, eq, sql } from "drizzle-orm";
import type { MagazaAyarlari } from "@/templates/magaza/tipler";
import { db } from "./db";
import { siparisler, siteler } from "./db/sema";
import {
  MAKS_ADET,
  SONRAKI_DURUMLAR,
  kurus,
  tutarlariHesapla,
  type OdemeYontemi,
  type Siparis,
  type SiparisDurumu,
  type Teslimat,
} from "./siparis";

const DENEME = 4;
const HARFLER = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // karışan harfler (O/0, I/1) yok
const kodUret = () => Array.from({ length: 6 }, () => HARFLER[randomInt(HARFLER.length)]).join("");

const donustur = (s: typeof siparisler.$inferSelect): Siparis => ({
  ...s,
  olusturma: s.olusturma.toISOString(),
  guncelleme: s.guncelleme.toISOString(),
});

async function siteyiOku(siteId: string) {
  const [s] = await db
    .select({ ayarlar: siteler.ayarlar, surum: siteler.surum, slug: siteler.slug, yayinda: siteler.yayinda })
    .from(siteler)
    .where(eq(siteler.id, siteId))
    .limit(1);
  return s ?? null;
}

export async function siparisOlustur(v: {
  siteId: string;
  musteriId: string;
  eposta: string;
  istenen: { ad: string; adet: number }[];
  teslimat: Teslimat;
  odemeYontemi: OdemeYontemi;
}): Promise<{ kod: string; slug: string | null } | { hata: string }> {
  // Aynı ürün iki kez gelmişse adetleri birleştir
  const sepet = new Map<string, number>();
  for (const k of v.istenen) sepet.set(k.ad, (sepet.get(k.ad) ?? 0) + k.adet);
  if (sepet.size === 0) return { hata: "Sepetin boş." };

  for (let deneme = 0; deneme < DENEME; deneme++) {
    const site = await siteyiOku(v.siteId);
    if (!site?.ayarlar || !site.yayinda) return { hata: "Mağaza şu an sipariş almıyor." };

    // Fiyatları ve stoğu MAĞAZANIN GÜNCEL verisinden al (tarayıcıdan gelen fiyata güvenme)
    const kalemler: Siparis["kalemler"] = [];
    const urunler = site.ayarlar.urunler.map((u) => ({ ...u }));
    for (const [ad, adet] of sepet) {
      const urun = urunler.find((u) => u.ad === ad);
      if (!urun) return { hata: `“${ad}” artık satışta değil. Sepetinden çıkarıp tekrar dene.` };
      if (!Number.isInteger(adet) || adet < 1 || adet > MAKS_ADET) return { hata: `“${ad}” için adet 1 ile ${MAKS_ADET} arasında olmalı.` };
      if (urun.stok !== undefined) {
        if (urun.stok < adet)
          return { hata: urun.stok === 0 ? `“${ad}” tükendi.` : `“${ad}” için stokta yalnızca ${urun.stok} adet kaldı.` };
        urun.stok -= adet;
      }
      kalemler.push({ ad, emoji: urun.emoji, birimKurus: kurus(urun.fiyat), adet });
    }
    const t = tutarlariHesapla(kalemler);
    const yeniAyarlar: MagazaAyarlari = { ...site.ayarlar, urunler };
    const kod = kodUret();

    try {
      const sonuc = await db.execute(sql`
        WITH g AS (
          UPDATE ${siteler} SET ayarlar = ${JSON.stringify(yeniAyarlar)}::jsonb, surum = surum + 1
          WHERE id = ${v.siteId} AND surum = ${site.surum}
          RETURNING id
        )
        INSERT INTO ${siparisler}
          (kod, site_id, musteri_id, eposta, odeme_yontemi, kalemler, teslimat, ara_toplam_kurus, kargo_kurus, toplam_kurus)
        SELECT ${kod}, g.id, ${v.musteriId}, ${v.eposta}, ${v.odemeYontemi}, ${JSON.stringify(kalemler)}::jsonb,
               ${JSON.stringify(v.teslimat)}::jsonb, ${t.araToplam}, ${t.kargo}, ${t.toplam}
        FROM g
        RETURNING kod`);
      if (sonuc.rows.length > 0) return { kod, slug: site.slug };
      // 0 satır: tam o sırada mağaza değişti (başka sipariş / sahip düzenlemesi) → baştan dene
    } catch {
      // nadiren: aynı sipariş kodu zaten var → yeni kodla tekrar dene
    }
  }
  return { hata: "Mağaza şu an çok yoğun, lütfen birkaç saniye sonra tekrar dene." };
}

export async function siteninSiparisleri(siteId: string) {
  const l = await db.select().from(siparisler).where(eq(siparisler.siteId, siteId)).orderBy(desc(siparisler.olusturma));
  return l.map(donustur);
}

export async function musterininSiparisleri(siteId: string, musteriId: string) {
  const l = await db
    .select()
    .from(siparisler)
    .where(and(eq(siparisler.siteId, siteId), eq(siparisler.musteriId, musteriId)))
    .orderBy(desc(siparisler.olusturma));
  return l.map(donustur);
}

export async function siparisBul(siteId: string, kod: string) {
  const [s] = await db
    .select()
    .from(siparisler)
    .where(and(eq(siparisler.siteId, siteId), eq(siparisler.kod, kod)))
    .limit(1);
  return s ? donustur(s) : null;
}

/**
 * Sipariş durumunu değiştirir (mağaza sahibi). İptalde stoklar geri eklenir —
 * bu da sipariş oluşturmadaki gibi "sürüm" kontrolüyle tek komutta yapılır.
 */
export async function siparisDurumGuncelle(
  siteId: string,
  siparisId: string,
  yeni: SiparisDurumu,
  kargoTakip: string | null,
): Promise<{ siparis: Siparis; slug: string | null } | { hata: string }> {
  for (let deneme = 0; deneme < DENEME; deneme++) {
    const [s] = await db
      .select()
      .from(siparisler)
      .where(and(eq(siparisler.id, siparisId), eq(siparisler.siteId, siteId)))
      .limit(1);
    if (!s) return { hata: "Sipariş bulunamadı." };
    if (!SONRAKI_DURUMLAR[s.durum].includes(yeni)) return { hata: "Bu sipariş bu duruma geçirilemez." };

    if (yeni !== "iptal") {
      const [g] = await db
        .update(siparisler)
        .set({ durum: yeni, kargoTakip: kargoTakip ?? s.kargoTakip, guncelleme: new Date() })
        .where(and(eq(siparisler.id, siparisId), eq(siparisler.durum, s.durum)))
        .returning();
      if (g) return { siparis: donustur(g), slug: null };
      continue; // arada durum değişmiş → tekrar dene
    }

    // İptal: stokları geri ekle
    const site = await siteyiOku(siteId);
    if (!site?.ayarlar) return { hata: "Mağaza bulunamadı." };
    const urunler = site.ayarlar.urunler.map((u) => {
      const kalem = s.kalemler.find((k) => k.ad === u.ad);
      return kalem && u.stok !== undefined ? { ...u, stok: u.stok + kalem.adet } : u;
    });
    const sonuc = await db.execute(sql`
      WITH g AS (
        UPDATE ${siteler} SET ayarlar = ${JSON.stringify({ ...site.ayarlar, urunler })}::jsonb, surum = surum + 1
        WHERE id = ${siteId} AND surum = ${site.surum}
        RETURNING id
      )
      UPDATE ${siparisler} SET durum = 'iptal', guncelleme = now()
      WHERE id = ${siparisId} AND durum = ${s.durum} AND EXISTS (SELECT 1 FROM g)
      RETURNING id`);
    if (sonuc.rows.length > 0) {
      const guncel = await siparisBul(siteId, s.kod);
      return { siparis: guncel!, slug: site.slug };
    }
  }
  return { hata: "Şu an güncellenemedi, tekrar dene." };
}
