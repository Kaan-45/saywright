// /m/... adresinde mağaza yoksa veya yayında değilse gösterilen sayfa
import Link from "next/link";
import Logo from "@/components/Logo";

export default function MagazaBulunamadi() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-zemin px-6 text-center text-gece">
      <Logo />
      <p className="mt-10 text-6xl">🏪</p>
      <h1 className="mt-4 text-2xl font-bold">Bu mağaza bulunamadı</h1>
      <p className="mt-2 max-w-sm text-derin">
        Adres yanlış yazılmış olabilir ya da mağaza sahibi siteyi şu an yayından kaldırmış olabilir.
      </p>
      <Link href="/" className="mt-8 rounded-xl bg-gece px-5 py-2.5 text-sm font-semibold text-white hover:bg-derin">
        Saywright ile kendi siteni oluştur
      </Link>
    </main>
  );
}
