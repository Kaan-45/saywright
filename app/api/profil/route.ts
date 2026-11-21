// ─────────────────────────────────────────────────────────────
// /api/profil — Profil işlemleri
//   PATCH  → adı güncelle
//   DELETE → hesabı kalıcı olarak sil (şifre + "SİL" onayı gerekir)
// ─────────────────────────────────────────────────────────────

import { mevcutKullanici, oturumKapat, sifreDogruMu } from "@/lib/oturum";
import { kullaniciGuncelle, kullaniciSil } from "@/lib/veritabani";

export async function PATCH(istek: Request) {
  const kullanici = await mevcutKullanici();
  if (!kullanici) return Response.json({ hata: "Oturumun kapanmış, tekrar giriş yap." }, { status: 401 });

  const { ad } = (await istek.json().catch(() => ({}))) as { ad?: string };
  const temizAd = String(ad ?? "").trim();
  if (temizAd.length < 2 || temizAd.length > 60)
    return Response.json({ hata: "Ad 2 ile 60 karakter arasında olmalı." }, { status: 400 });

  await kullaniciGuncelle(kullanici.id, { ad: temizAd });
  return Response.json({ ad: temizAd });
}

export async function DELETE(istek: Request) {
  const kullanici = await mevcutKullanici();
  if (!kullanici) return Response.json({ hata: "Oturumun kapanmış, tekrar giriş yap." }, { status: 401 });

  const { sifre, onay } = (await istek.json().catch(() => ({}))) as { sifre?: string; onay?: string };
  if (onay !== "SİL") return Response.json({ hata: "Onaylamak için kutuya büyük harflerle SİL yaz." }, { status: 400 });
  if (!sifreDogruMu(String(sifre ?? ""), kullanici.sifreHash))
    return Response.json({ hata: "Şifre hatalı." }, { status: 401 });

  await oturumKapat(); // önce çerezi temizle
  await kullaniciSil(kullanici.id); // sonra hesabı, siteleri ve oturumları sil
  return Response.json({ tamam: true });
}
