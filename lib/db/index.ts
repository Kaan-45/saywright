// ─────────────────────────────────────────────────────────────
// lib/db/index.ts — Neon veritabanı bağlantısı
// Bağlantı adresi .env.local içindeki DATABASE_URL'den okunur.
// ─────────────────────────────────────────────────────────────

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as sema from "./sema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL bulunamadı. .env.local dosyasına Neon bağlantı adresini ekle.");
}

export const db = drizzle(neon(process.env.DATABASE_URL), { schema: sema });
