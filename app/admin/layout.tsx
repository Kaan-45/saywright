// ─────────────────────────────────────────────────────────────
// app/admin/layout.tsx — Saywright SÜPER ADMIN paneli çerçevesi (sadece rolü "admin" olanlar)
//
// Admin değilsen bu adres "bulunamadı" (404) gösterir; panelin var olduğu bile belli olmaz.
// Sayfalar da kendi içinde ayrıca kontrol eder (çift kilit).
// ─────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import AdminMenu from "@/components/admin/AdminMenu";
import { adminKullanici, istatistikler } from "@/lib/admin";

// Başlık bilerek genel: admin olmayanlara panelin varlığını belli etmesin
export const metadata: Metadata = { title: "Saywright", robots: { index: false, follow: false } };

async function Kabuk({ children }: { children: React.ReactNode }) {
  const admin = await adminKullanici();
  if (!admin) notFound();
  const { talep } = await istatistikler();
  return (
    <div className="flex min-h-screen flex-col bg-zemin text-gece md:flex-row">
      <AdminMenu ad={admin.ad} bekleyenTalep={talep.bekleyen} />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

export default function AdminDuzeni({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="grid min-h-screen place-items-center bg-zemin text-sm text-derin/60">Yükleniyor…</div>}>
      <Kabuk>{children}</Kabuk>
    </Suspense>
  );
}
