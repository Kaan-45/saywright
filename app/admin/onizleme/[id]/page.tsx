// app/admin/onizleme/[id]/page.tsx — Süper admin: yayına almadan önce sitenin içeriğini incele
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { adminKullanici } from "@/lib/admin";
import { siteBul } from "@/lib/veritabani";
import MagazaSablonu from "@/templates/magaza/MagazaSablonu";

export default function AdminOnizleme({ params }: PageProps<"/admin/onizleme/[id]">) {
  return (
    <Suspense fallback={<div className="p-10 text-sm text-derin/60">Yükleniyor…</div>}>
      <Icerik params={params} />
    </Suspense>
  );
}

async function Icerik({ params }: { params: Promise<{ id: string }> }) {
  if (!(await adminKullanici())) notFound();
  const site = await siteBul((await params).id);
  if (!site?.ayarlar) notFound();
  return (
    <div>
      <p className="bg-amber-100 px-4 py-2 text-center text-xs font-semibold text-amber-900">
        🛡️ Admin önizlemesi · İncele: yasa dışı ürün, sahte marka, yanıltıcı fiyat, uygunsuz içerik var mı?
      </p>
      <MagazaSablonu ayarlar={site.ayarlar} />
    </div>
  );
}
