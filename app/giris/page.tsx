import type { Metadata } from "next";
import KimlikSayfasi from "@/components/KimlikSayfasi";

export const metadata: Metadata = { title: "Giriş yap · Saywright" };

export default function GirisSayfasi() {
  return <KimlikSayfasi tur="giris" />;
}
