import type { Metadata } from "next";
import KimlikSayfasi from "@/components/KimlikSayfasi";

export const metadata: Metadata = { title: "Kaydol · Saywright" };

export default function KayitSayfasi() {
  return <KimlikSayfasi tur="kayit" />;
}
