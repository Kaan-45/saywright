// ─────────────────────────────────────────────────────────────
// scripts/admin-yap.mjs — Bir Saywright hesabını süper admin yapar (veya geri alır)
//
// Kullanım (proje klasöründe):
//   npm run admin:yap -- sen@ornek.com          → admin yapar
//   npm run admin:yap -- sen@ornek.com --geri   → normal kullanıcıya çevirir
//
// Neden bir buton değil de komut? Çünkü "beni admin yap" butonu olsaydı onu herkes
// kullanabilirdi. Bu komutu sadece veritabanı şifresine (.env.local) sahip olan çalıştırabilir.
// ─────────────────────────────────────────────────────────────

import { neon } from "@neondatabase/serverless";

process.loadEnvFile(".env.local");
const eposta = process.argv[2]?.trim().toLowerCase();
const geri = process.argv.includes("--geri");

if (!eposta || !eposta.includes("@")) {
  console.error("E-posta yaz:  npm run admin:yap -- sen@ornek.com");
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);
const rol = geri ? "kullanici" : "admin";
const sonuc = await sql`update kullanicilar set rol = ${rol} where lower(eposta) = ${eposta} returning ad, eposta, rol`;

if (sonuc.length === 0) {
  console.error(`Bu e-postayla kayıtlı hesap yok: ${eposta}`);
  process.exit(1);
}
console.log(`✓ ${sonuc[0].ad} (${sonuc[0].eposta}) artık: ${sonuc[0].rol}`);
