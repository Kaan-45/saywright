// drizzle-kit ayarları: tablo tanımları nerede, veritabanı nerede?
import { defineConfig } from "drizzle-kit";

// drizzle-kit, Next.js gibi .env.local dosyasını kendiliğinden okumaz; biz okutuyoruz.
process.loadEnvFile(".env.local");

export default defineConfig({
  schema: "./lib/db/sema.ts",
  out: "./drizzle", // tablo değişikliklerinin kaydı (migration dosyaları) buraya yazılır
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL! },
});
