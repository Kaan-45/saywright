// app/eposta-dogrula/page.tsx — E-postadaki linke tıklandıktan sonraki sonuç ekranı
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import Logo from "@/components/Logo";

export const metadata: Metadata = { title: "E-posta doğrulama · Saywright" };

export default function EpostaDogrulaSayfasi({ searchParams }: PageProps<"/eposta-dogrula">) {
  return (
    <main className="flex min-h-screen flex-col bg-zemin px-6 py-6 text-gece">
      <Logo />
      <div className="mx-auto my-auto w-full max-w-md rounded-3xl border border-cizgi bg-kart p-8 text-center">
        <Suspense fallback={<p className="text-sm text-derin/60">Kontrol ediliyor…</p>}>
          <Sonuc searchParams={searchParams} />
        </Suspense>
      </div>
    </main>
  );
}

async function Sonuc({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const tamam = (await searchParams).durum === "tamam";
  return tamam ? (
    <>
      <p className="text-5xl">✅</p>
      <h1 className="mt-4 text-2xl font-bold">E-postan doğrulandı</h1>
      <p className="mt-2 text-sm text-derin">Teşekkürler! Artık site oluşturabilir ve yapay zekayla tasarlamaya başlayabilirsin.</p>
      <Link href="/panel" className="mt-6 inline-block rounded-xl bg-gece px-6 py-3 text-sm font-semibold text-white hover:bg-derin">
        Panelime git →
      </Link>
    </>
  ) : (
    <>
      <p className="text-5xl">⚠️</p>
      <h1 className="mt-4 text-2xl font-bold">Bu link geçersiz</h1>
      <p className="mt-2 text-sm text-derin">
        Linkin süresi dolmuş, daha önce kullanılmış ya da yerine yenisi gönderilmiş olabilir. Paneline girip yeni bir doğrulama linki iste.
      </p>
      <Link href="/panel" className="mt-6 inline-block rounded-xl bg-gece px-6 py-3 text-sm font-semibold text-white hover:bg-derin">
        Panelime git
      </Link>
    </>
  );
}
