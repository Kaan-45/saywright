// ─────────────────────────────────────────────────────────────
// lib/db/sema.ts — Veritabanı tablolarının tanımı (Drizzle)
//
// Her "pgTable" Neon'daki bir tabloya karşılık gelir.
// Bu dosyayı değiştirdikten sonra tabloları güncellemek için iki adım:
//   npm run db:generate   → değişikliği "drizzle" klasörüne bir SQL dosyası olarak yazar
//   npm run db:migrate    → o SQL'i Neon'da çalıştırır
// Tabloların içini görmek için:  npm run db:studio
// ─────────────────────────────────────────────────────────────

import { sql } from "drizzle-orm";
import { boolean, integer, jsonb, pgTable, text, timestamp, uuid, index, unique, uniqueIndex } from "drizzle-orm/pg-core";
import type { MagazaAyarlari } from "@/templates/magaza/tipler";

// Ortak tip: sohbet geçmişindeki tek bir mesaj
export type SohbetMesaji = { kimden: "musteri" | "sihirbaz"; metin: string };

// ── Site sahipleri (Saywright'a kayıt olanlar) ──
export const kullanicilar = pgTable("kullanicilar", {
  id: uuid("id").primaryKey().defaultRandom(),
  ad: text("ad").notNull(),
  eposta: text("eposta").notNull().unique(), // aynı e-postayla iki hesap açılamaz
  sifreHash: text("sifre_hash").notNull(), // şifrenin kendisi değil, "parmak izi"
  plan: text("plan", { enum: ["ucretsiz", "pro", "isletme"] }).notNull().default("ucretsiz"),
  olusturulanSiteSayisi: integer("olusturulan_site_sayisi").notNull().default(0),
  // "admin" = Saywright yöneticisi (sen). /admin paneline sadece bunlar girebilir.
  rol: text("rol", { enum: ["kullanici", "admin"] }).notNull().default("kullanici"),
  // E-postadaki linke tıklayınca dolar. Boşsa hesap "doğrulanmamış" (site oluşturamaz).
  epostaDogrulandi: timestamp("eposta_dogrulandi", { withTimezone: true }),
  kayitTarihi: timestamp("kayit_tarihi", { withTimezone: true }).notNull().defaultNow(),
});

// ── E-posta doğrulama biletleri ──
// Linkteki rastgele bileti DEĞİL, onun "parmak izini" (sha256) saklarız: veritabanı
// bir gün sızsa bile oradaki değerlerle kimse hesap doğrulayamaz.
export const epostaDogrulamalari = pgTable(
  "eposta_dogrulamalari",
  {
    tokenHash: text("token_hash").primaryKey(),
    kullaniciId: uuid("kullanici_id")
      .notNull()
      .references(() => kullanicilar.id, { onDelete: "cascade" }),
    bitis: timestamp("bitis", { withTimezone: true }).notNull(),
    olusturma: timestamp("olusturma", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("eposta_dogrulama_kullanici_idx").on(t.kullaniciId)],
);

// ── Giriş oturumları (tarayıcıdaki çerezle eşleşen biletler) ──
export const oturumlar = pgTable(
  "oturumlar",
  {
    token: text("token").primaryKey(),
    // Kullanıcı silinirse oturumları da otomatik silinsin (cascade)
    kullaniciId: uuid("kullanici_id")
      .notNull()
      .references(() => kullanicilar.id, { onDelete: "cascade" }),
    bitis: timestamp("bitis", { withTimezone: true }).notNull(),
  },
  (t) => [index("oturumlar_kullanici_idx").on(t.kullaniciId)],
);

// ── Siteler (mağazalar) ──
export const siteler = pgTable(
  "siteler",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    kullaniciId: uuid("kullanici_id")
      .notNull()
      .references(() => kullanicilar.id, { onDelete: "cascade" }),
    // jsonb: ayarları olduğu gibi (JSON olarak) saklar. İleride ürünleri ayrı tabloya taşıyacağız.
    ayarlar: jsonb("ayarlar").$type<MagazaAyarlari>(),
    mesajlar: jsonb("mesajlar").$type<SohbetMesaji[]>().notNull().default([]),
    yapayZekaMesajSayisi: integer("yapay_zeka_mesaj_sayisi").notNull().default(0),
    // Ayarlar her değiştiğinde 1 artar. İki kişi aynı anda değiştirmeye çalışırsa
    // (örn. sahip ürün düzenlerken müşteri sipariş verip stok düşerse) biri diğerini ezmesin diye.
    surum: integer("surum").notNull().default(0),
    // Yayın bilgileri: mağaza /m/[slug] adresinden herkese açık olur
    slug: text("slug").unique(), // örn. "lavmira-mum" — iki mağaza aynı adresi alamaz
    yayinda: boolean("yayinda").notNull().default(false),
    yayinTarihi: timestamp("yayin_tarihi", { withTimezone: true }),
    // Saywright admini yayın talebini onayladığında dolar. Boşsa sahibi siteyi kendi başına yayınlayamaz.
    yayinOnayi: timestamp("yayin_onayi", { withTimezone: true }),
    // Bağlanmış kendi alan adı, örn. "lavmiramum.com" (admin satın alıp bağlayınca yazılır)
    alanAdi: text("alan_adi").unique(),
    olusturma: timestamp("olusturma", { withTimezone: true }).notNull().defaultNow(),
    guncelleme: timestamp("guncelleme", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("siteler_kullanici_idx").on(t.kullaniciId)],
);

// ── Yayın talepleri ──
// Müşteri "Yayınla" dediğinde buraya bir kayıt düşer; Saywright admini ödemeyi ve içeriği
// kontrol edip onaylar ya da reddeder. Bir sitenin aynı anda tek bir bekleyen talebi olabilir.
export const yayinTalepleri = pgTable(
  "yayin_talepleri",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    kullaniciId: uuid("kullanici_id")
      .notNull()
      .references(() => kullanicilar.id, { onDelete: "cascade" }),
    siteId: uuid("site_id")
      .notNull()
      .references(() => siteler.id, { onDelete: "cascade" }),
    durum: text("durum", { enum: ["bekliyor", "onaylandi", "reddedildi", "iptal"] }).notNull().default("bekliyor"),
    slug: text("slug").notNull(), // istenen Saywright adresi (yedek adres)
    alanAdi: text("alan_adi"), // istenen kendi alan adı, örn. "abc.com" (boşsa istemiyor)
    // "yeni" = bizim satın almamızı istiyor · "mevcut" = zaten kendisinin, sadece bağlanacak
    alanAdiTuru: text("alan_adi_turu", { enum: ["yeni", "mevcut"] }),
    istenenPlan: text("istenen_plan", { enum: ["pro", "isletme"] }), // boşsa zaten paketi var, ödeme yok
    tutarKurus: integer("tutar_kurus").notNull().default(0),
    odemeKodu: text("odeme_kodu").notNull(), // havale açıklamasına yazılacak kısa kod, örn. "SW-7K2Q"
    adminNotu: text("admin_notu"), // reddedilirse sebebi müşteriye gösterilir
    olusturma: timestamp("olusturma", { withTimezone: true }).notNull().defaultNow(),
    kararTarihi: timestamp("karar_tarihi", { withTimezone: true }),
  },
  (t) => [
    index("yayin_talebi_durum_idx").on(t.durum),
    // Aynı site için iki tane "bekliyor" talep olamaz
    uniqueIndex("yayin_talebi_bekleyen_uniq").on(t.siteId).where(sql`${t.durum} = 'bekliyor'`),
  ],
);

// ── Mağaza müşterileri (bir mağazaya üye olan ziyaretçiler) ──
// Her kayıt bir mağazaya (site_id) bağlı: aynı e-posta farklı mağazalarda ayrı hesaptır.
export const magazaMusterileri = pgTable(
  "magaza_musterileri",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    siteId: uuid("site_id")
      .notNull()
      .references(() => siteler.id, { onDelete: "cascade" }), // mağaza silinirse müşterileri de silinir
    ad: text("ad").notNull(),
    eposta: text("eposta").notNull(),
    sifreHash: text("sifre_hash").notNull(),
    telefon: text("telefon"),
    kvkkOnayTarihi: timestamp("kvkk_onay_tarihi", { withTimezone: true }).notNull(), // KVKK onayının kanıtı
    kayitTarihi: timestamp("kayit_tarihi", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [unique("magaza_musteri_eposta_uniq").on(t.siteId, t.eposta)],
);

// ── Siparişler ──
// Ürün adı ve fiyatı sipariş anında "kopyalanır" (kalemler): ürün sonradan değişse/silinse bile
// sipariş kaydı o anki haliyle kalır. Tutarlar kuruş cinsinden tam sayı (küsurat hatası olmasın).
export const siparisler = pgTable(
  "siparisler",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    kod: text("kod").notNull().unique(), // müşteriye gösterilen kısa sipariş numarası, örn. "K7M2Q9"
    siteId: uuid("site_id")
      .notNull()
      .references(() => siteler.id, { onDelete: "cascade" }),
    // Müşteri hesabını silse bile sipariş kaydı (yasal saklama için) kalır, bağlantı boşalır
    musteriId: uuid("musteri_id").references(() => magazaMusterileri.id, { onDelete: "set null" }),
    eposta: text("eposta").notNull(),
    durum: text("durum", { enum: ["yeni", "hazirlaniyor", "kargoda", "teslim", "iptal"] }).notNull().default("yeni"),
    odemeYontemi: text("odeme_yontemi", { enum: ["kapida", "havale"] }).notNull(),
    kalemler: jsonb("kalemler").$type<{ ad: string; emoji: string; birimKurus: number; adet: number }[]>().notNull(),
    teslimat: jsonb("teslimat")
      .$type<{ adSoyad: string; telefon: string; il: string; ilce: string; adres: string; not?: string }>()
      .notNull(),
    araToplamKurus: integer("ara_toplam_kurus").notNull(),
    kargoKurus: integer("kargo_kurus").notNull(),
    toplamKurus: integer("toplam_kurus").notNull(),
    kargoTakip: text("kargo_takip"),
    olusturma: timestamp("olusturma", { withTimezone: true }).notNull().defaultNow(),
    guncelleme: timestamp("guncelleme", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("siparis_site_idx").on(t.siteId), index("siparis_musteri_idx").on(t.musteriId)],
);

// ── Mağaza müşterilerinin giriş oturumları ──
export const magazaOturumlari = pgTable(
  "magaza_oturumlari",
  {
    token: text("token").primaryKey(),
    musteriId: uuid("musteri_id")
      .notNull()
      .references(() => magazaMusterileri.id, { onDelete: "cascade" }),
    siteId: uuid("site_id").notNull(),
    bitis: timestamp("bitis", { withTimezone: true }).notNull(),
  },
  (t) => [index("magaza_oturum_musteri_idx").on(t.musteriId)],
);
