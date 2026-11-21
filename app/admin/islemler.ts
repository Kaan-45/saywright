// ─────────────────────────────────────────────────────────────
// app/admin/islemler.ts — Süper admin panelindeki butonların sunucu işlemleri
// ("Server Action": formdan doğrudan sunucuda çalışan fonksiyon)
//
// Her işlem önce adminKullanici() ile yetkiyi YENİDEN kontrol eder. Sayfanın
// kendisini gizlemek yetmez; biri bu işlemleri elle çağırmaya kalkabilir.
// ─────────────────────────────────────────────────────────────
"use server";

import { refresh } from "next/cache";
import { adminKullanici, siteAlanAdiAyarla, siteAskiyaAl } from "@/lib/admin";
import { bagliAlanAdiHatasi } from "@/lib/alanAdi";
import { magazaOnbellegiTemizle } from "@/lib/magazalar";
import { PLANLAR, type PlanKodu } from "@/lib/planlar";
import { kullaniciGuncelle } from "@/lib/veritabani";
import { talepOnayla, talepReddet } from "@/lib/yayinTalepleri";

export type IslemSonucu = { tur: "basari" | "hata"; mesaj: string } | null;

const yetkisiz: IslemSonucu = { tur: "hata", mesaj: "Bu işlem için yetkin yok." };
const metin = (f: FormData, ad: string) => String(f.get(ad) ?? "").trim();

export async function talebiOnayla(_: IslemSonucu, f: FormData): Promise<IslemSonucu> {
  if (!(await adminKullanici())) return yetkisiz;
  const sonuc = await talepOnayla(metin(f, "talepId"), metin(f, "not") || null);
  if (sonuc.tur === "bulunamadi") return { tur: "hata", mesaj: "Talep bulunamadı ya da zaten sonuçlanmış." };
  if (sonuc.tur === "slug_dolu") return { tur: "hata", mesaj: "Bu adres bu arada başka bir mağazaya verilmiş. Talebi reddedip yeni adres iste." };
  magazaOnbellegiTemizle(sonuc.eskiSlug);
  magazaOnbellegiTemizle(sonuc.yeniSlug);
  refresh();
  return { tur: "basari", mesaj: "Onaylandı, site yayında. 🎉" };
}

export async function talebiReddet(_: IslemSonucu, f: FormData): Promise<IslemSonucu> {
  if (!(await adminKullanici())) return yetkisiz;
  const sebep = metin(f, "sebep");
  if (sebep.length < 5) return { tur: "hata", mesaj: "Müşteriye gösterilecek bir sebep yaz." };
  if (!(await talepReddet(metin(f, "talepId"), sebep))) return { tur: "hata", mesaj: "Talep bulunamadı ya da zaten sonuçlanmış." };
  refresh();
  return { tur: "basari", mesaj: "Reddedildi." };
}

export async function planDegistir(_: IslemSonucu, f: FormData): Promise<IslemSonucu> {
  if (!(await adminKullanici())) return yetkisiz;
  const plan = metin(f, "plan");
  if (!(plan in PLANLAR)) return { tur: "hata", mesaj: "Geçersiz paket." };
  if (!(await kullaniciGuncelle(metin(f, "kullaniciId"), { plan: plan as PlanKodu })))
    return { tur: "hata", mesaj: "Kullanıcı bulunamadı." };
  refresh();
  return { tur: "basari", mesaj: `Paket: ${PLANLAR[plan as PlanKodu].ad}` };
}

export async function siteyiAskiyaAl(_: IslemSonucu, f: FormData): Promise<IslemSonucu> {
  if (!(await adminKullanici())) return yetkisiz;
  const s = await siteAskiyaAl(metin(f, "siteId"));
  if (!s) return { tur: "hata", mesaj: "Site bulunamadı." };
  magazaOnbellegiTemizle(s.slug);
  refresh();
  return { tur: "basari", mesaj: "Yayından kaldırıldı." };
}

export async function alanAdiKaydet(_: IslemSonucu, f: FormData): Promise<IslemSonucu> {
  if (!(await adminKullanici())) return yetkisiz;
  const alanAdi = metin(f, "alanAdi").toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "") || null;
  if (alanAdi) {
    const h = bagliAlanAdiHatasi(alanAdi);
    if (h) return { tur: "hata", mesaj: h };
  }
  if (!(await siteAlanAdiAyarla(metin(f, "siteId"), alanAdi)))
    return { tur: "hata", mesaj: "Bu alan adı başka bir siteye bağlı." };
  refresh();
  return { tur: "basari", mesaj: alanAdi ? "Kaydedildi." : "Kaldırıldı." };
}
