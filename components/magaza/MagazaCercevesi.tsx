// Mağazanın alt sayfaları (giriş, kayıt, hesabım, KVKK) için mağaza renkleriyle sade bir çerçeve
import Link from "next/link";
import type { MagazaAyarlari } from "@/templates/magaza/tipler";

export default function MagazaCercevesi({
  ayarlar,
  slug,
  children,
  genis = false,
}: {
  ayarlar: MagazaAyarlari;
  slug: string;
  children: React.ReactNode;
  genis?: boolean;
}) {
  const { renk } = ayarlar;
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 text-zinc-900" style={{ background: `linear-gradient(180deg, ${renk.acik} 0%, #fafafa 320px)` }}>
      <div className="px-4 py-2 text-center text-xs font-medium text-white" style={{ background: renk.ana }}>
        🔒 Bilgilerin güvende · Şifren şifrelenerek saklanır
      </div>
      <header className="border-b border-black/5 bg-white/70 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Link href={`/m/${slug}`} className="text-2xl font-black tracking-tight" style={{ color: renk.ana }}>
            {ayarlar.magazaAdi}
          </Link>
          <Link href={`/m/${slug}`} className="text-sm text-zinc-600 hover:text-zinc-900">
            ← Alışverişe dön
          </Link>
        </div>
      </header>
      <main className={`mx-auto w-full flex-1 px-4 py-10 ${genis ? "max-w-4xl" : "max-w-md"}`}>{children}</main>
      <footer className="py-6 text-center text-xs text-zinc-500">
        © {ayarlar.magazaAdi} ·{" "}
        <Link href={`/m/${slug}/kvkk`} className="underline hover:text-zinc-800">
          KVKK Aydınlatma Metni
        </Link>
      </footer>
    </div>
  );
}
