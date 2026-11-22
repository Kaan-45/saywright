# Saywright — Anlat, siten hazır olsun

**Saywright**, kod bilmeyen birinin alışveriş sitesini **Türkçe sohbet ederek** kurmasını sağlayan, yapay zeka destekli bir site oluşturucudur.
"El yapımı mum satan, mor tonlarda bir mağaza istiyorum" yazarsın; Claude ürünleri, renkleri, kategorileri ve yazıları hazırlar, sen de sonucu anında canlı önizlemede görürsün.

🌐 **Canlı demo:** [saywright-dm2l.vercel.app](https://saywright-dm2l.vercel.app)

> 🇬🇧 **In English:** Saywright is an AI-powered website builder for Turkish small businesses. Users describe the online store they want in plain Turkish; Claude (Anthropic API, structured outputs) turns each message into a validated store configuration that is rendered live. Built with Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Drizzle ORM and Neon Postgres, deployed on Vercel. Includes auth, email verification, a store admin panel with orders, store customer accounts, a publish-approval workflow and a super-admin panel. The public demo runs in a cost-free *demo mode* (rule-based assistant + one-click style options); the real Claude integration is shown in the video below.

---

## 🧪 Canlı demo hakkında (önemli)

Sistem normalde **Claude API** ile çalışıyor: müşterinin serbestçe yazdığı her isteği anlayıp siteyi baştan sona düzenliyor.

Bu depo herkese açık ve canlı demoda e-posta doğrulaması (gönderim servisi) henüz kurulu değil. Herkesin sınırsız hesap açıp gerçek yapay zekaya masraf çıkarabilmesini önlemek için **canlı demoda Claude bilerek kapalı**. Onun yerine:

- 🤖 Sohbete **kurallarla çalışan basit bir asistan** cevap veriyor (ör. "adı Kahve Durağı olsun", "rengi yeşil yap", "SSS bölümü ekle").
- 🎨 **Hızlı seçenekler** ile siteyi tıklayarak değiştirebiliyorsun: mağaza türü, ana renk, arka plan rengi, yazı rengi ve bölümler. Bunlar mesaj hakkı harcamaz.

Kod tarafında bu tek bir şarta bağlı: `ANTHROPIC_API_KEY` tanımlıysa gerçek Claude, değilse demo modu (`lib/demo.ts`). Gerçek Claude ile nasıl çalıştığını aşağıdaki videoda görebilirsin.

## 🎬 Gerçek Claude ile demo

Yerelde, gerçek Claude açıkken çekilmiş kısa bir kayıt: Türkçe anlatılan istekten mağazanın oluşması ve sohbetle düzenlenmesi.

▶️ **[Videoyu izle (MP4, ~12 MB)](docs/saywright-demo.mp4)**

## ✨ Özellikler

**Site sahibi için**
- 💬 **Sohbetle tasarım:** Her mesaj mağazanın ayarlarını günceller; sonuç canlı önizlemede görünür.
- 🎨 **Hızlı seçenekler:** Yazmadan, tıklayarak renk / tür / bölüm değiştirme.
- 🛍️ **Hazır mağaza şablonu:** Ürünler, kategoriler, sepet, ödeme adımı, sipariş takibi.
- 🧑‍💼 **Mağaza yönetim paneli:** Ürün ekle/sil, stok ve indirim gir, siparişleri yönet, müşterileri gör.
- 🚀 **Yayın talebi:** Adres (`/m/magaza-adi`) ve isteğe bağlı kendi alan adını seç; uzantı fiyatlarını (.com, .com.tr, .store…) karşılaştır, talebini gönder.
- ✉️ **E-posta doğrulaması:** Gerçek yapay zeka açıkken, doğrulanmamış hesaplar site oluşturamaz.

**Mağaza müşterisi için**
- Hesap açma, giriş, sepet, sipariş verme ve "Hesabım" sayfasından sipariş durumunu izleme.

**Saywright yöneticisi için (`/admin`)**
- Yayın taleplerini onaylama / reddetme, kullanıcıların paketini değiştirme, siteleri yayından kaldırma, alan adı kaydetme, genel istatistikler.

## 🧱 Teknolojiler

| Alan | Kullanılan |
|---|---|
| Uygulama | Next.js 16 (App Router, Server Components, Server Actions, Cache Components), React 19, TypeScript |
| Tasarım | Tailwind CSS v4 |
| Yapay zeka | Anthropic Claude API, Zod şemasıyla *structured outputs* |
| Veritabanı | Neon Postgres + Drizzle ORM (şema ve migration'lar `drizzle/` içinde) |
| E-posta | Resend (anahtar yoksa geliştirmede doğrulama linki panelde gösterilir) |
| Yayın | Vercel (GitHub'a her gönderimde otomatik deploy) |

## 🔐 Güvenlik ve tasarım kararları

- **Yapay zekanın çıktısı serbest metin değil:** Claude'un cevabı bir Zod şemasıyla sınırlanır (`templates/magaza/sema.ts`). Model şemanın dışına çıkamaz; aynı şema yönetim panelinden gelen kayıtları da sunucuda doğrular.
- **Yapay zeka kod yazmaz, ayar doldurur:** Site, bir ayar nesnesinden (`templates/magaza/tipler.ts`) çizilir. Yapay zeka yalnızca bu nesneyi günceller; böylece çıktı her zaman çalışan, güvenli bir site olur.
- **Ayarlar tarayıcıdan değil veritabanından okunur:** Kullanıcı sahte ayar gönderip sistemi kandıramaz (`app/api/sihirbaz/route.ts`). Hızlı seçenekler de sunucuda izin verilen listeye göre kontrol edilir.
- **Şifreler** `scrypt` + rastgele tuz ile saklanır; **oturumlar** `httpOnly` çerezde, rastgele 256-bit bilet ile tutulur.
- **E-posta doğrulama bağlantıları** veritabanında yalnızca `sha256` özeti olarak durur; 24 saat geçerli, tek kullanımlık, yeniden gönderme 60 sn sınırlı.
- **Yarış durumlarına karşı atomik sorgular:** Site hakkı düşme, yayın talebi onaylama gibi işlemler koşullu `UPDATE … WHERE … RETURNING` ile yapılır; aynı site için tek bekleyen talep, kısmi benzersiz indeksle garanti edilir. Panelde aynı anda yapılan değişiklikler sürüm numarasıyla çakışma kontrolünden geçer.
- **Hiçbir anahtar kodda değil:** API anahtarları, veritabanı adresi ve banka bilgileri ortam değişkenlerinden okunur.

## 📁 Proje yapısı

```
app/                 Sayfalar ve API uçları (App Router)
  api/               Kayıt, giriş, sihirbaz, siteler, yayın talebi, e-posta doğrulama…
  admin/             Saywright yönetici paneli
  panel/             Site sahibinin paneli (projeler, üyelik, profil, yayınla)
  olustur/[id]/      Sohbetle site oluşturma ekranı
  yonetim/[id]/      Mağaza yönetim paneli
  m/[slug]/          Yayındaki mağazanın kendisi (ziyaretçi tarafı)
components/          Arayüz bileşenleri
lib/                 Sunucu mantığı (veritabanı, oturum, planlar, yapay zeka, e-posta…)
  claudeYapayZeka.ts Gerçek yapay zeka (Claude API)
  sahteYapayZeka.ts  Demo modundaki kural tabanlı asistan
  demoSecenekleri.ts Hızlı seçenekler
  db/sema.ts         Veritabanı şeması (Drizzle)
templates/magaza/    Mağaza şablonu, tipleri ve Zod şeması
drizzle/             SQL migration dosyaları
scripts/             Yardımcı komutlar (ör. kullanıcıyı yönetici yapma)
```

> Kod ve yorumlar bilinçli olarak **Türkçe** yazıldı: proje Türkçe konuşan kullanıcılar için ve Türkçe öğrenerek geliştirildi.

## 🛠️ Kendi bilgisayarında çalıştırma

1. Paketleri kur:
   ```bash
   npm install
   ```
2. Proje klasöründe `.env.local` adında bir dosya oluşturup ortam değişkenlerini yaz:

   | Değişken | Zorunlu mu? | Açıklama |
   |---|---|---|
   | `DATABASE_URL` | Evet | Neon (Postgres) bağlantı adresi |
   | `ANTHROPIC_API_KEY` | Hayır | Yoksa uygulama demo modunda çalışır |
   | `SITE_ADRESI` | Canlıda evet | Doğrulama linkleri için sitenin adresi, ör. `https://ornek.vercel.app` |
   | `RESEND_API_KEY`, `EPOSTA_GONDEREN` | Hayır | Doğrulama e-postalarını göndermek için |
   | `HAVALE_ALICI`, `HAVALE_BANKA`, `HAVALE_IBAN` | Hayır | Yayın ödemesi için banka bilgileri; yoksa örnek bilgiler gösterilir |

3. Veritabanı tablolarını oluştur:
   ```bash
   npm run db:migrate
   ```
4. Geliştirme sunucusunu başlat ve [http://localhost:3000](http://localhost:3000) adresini aç:
   ```bash
   npm run dev
   ```
5. (İsteğe bağlı) Kendini yönetici yap:
   ```bash
   npm run admin:yap -- senin@epostan.com
   ```

## 🗺️ Yol haritası

- E-posta gönderimi (Resend) ve canlıda gerçek Claude'u tekrar açmak
- Kart ile ödeme (iyzico / PayTR)
- Alt alan adı ve kendi alan adını otomatik bağlama
- Şifre sıfırlama
- Restoran şablonu, ürün fotoğrafı yükleme

## 🤖 Geliştirme notu

Bu proje, **yapay zeka destekli geliştirme** ile (Claude Code) adım adım öğrenilerek yapıldı. Ürün fikri, paket ve fiyat kararları, kullanıcı akışları, testler ve yayına alma süreci benim yönetimimde ilerledi.

## 📄 Lisans

Tüm hakları saklıdır. Kod incelemek ve öğrenmek için herkese açıktır; izin alınmadan kopyalanıp kullanılamaz veya yayınlanamaz.
