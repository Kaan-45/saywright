// ─────────────────────────────────────────────────────────────
// app/m/[slug]/admin/page.tsx — Kısayol: saywright.org/m/lavmira-mum/admin
// Mağaza sahibini kendi admin paneline (/yonetim/...) yönlendirir.
// Giriş yapmamışsa ya da mağaza onun değilse oradaki kontroller devreye girer.
// ─────────────────────────────────────────────────────────────

import { eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { db } from "@/lib/db";
import { siteler } from "@/lib/db/sema";

export default function MagazaAdminKisayolu({ params }: PageProps<"/m/[slug]/admin">) {
  return (
    <Suspense fallback={<div className="grid min-h-screen place-items-center text-sm">Yönlendiriliyor…</div>}>
      <Yonlendir params={params} />
    </Suspense>
  );
}

async function Yonlendir({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [s] = await db.select({ id: siteler.id }).from(siteler).where(eq(siteler.slug, slug)).limit(1);
  if (!s) notFound();
  redirect(`/yonetim/${s.id}`);
  return null;
}
