// POST /api/profil/sifre — şifre değiştir. Güvenlik için diğer cihazlardaki oturumlar kapatılır.
import { mevcutKullanici, mevcutToken, sifreDogruMu, sifreHashle } from "@/lib/oturum";
import { digerOturumlariSil, kullaniciGuncelle } from "@/lib/veritabani";

export async function POST(istek: Request) {
  const kullanici = await mevcutKullanici();
  const token = await mevcutToken();
  if (!kullanici || !token) return Response.json({ hata: "Oturumun kapanmış, tekrar giriş yap." }, { status: 401 });

  const { mevcut, yeni } = (await istek.json().catch(() => ({}))) as { mevcut?: string; yeni?: string };
  if (!sifreDogruMu(String(mevcut ?? ""), kullanici.sifreHash))
    return Response.json({ hata: "Mevcut şifren hatalı." }, { status: 401 });
  if (String(yeni ?? "").length < 8) return Response.json({ hata: "Yeni şifre en az 8 karakter olmalı." }, { status: 400 });
  if (yeni === mevcut) return Response.json({ hata: "Yeni şifre eskisiyle aynı olamaz." }, { status: 400 });

  await kullaniciGuncelle(kullanici.id, { sifreHash: sifreHashle(String(yeni)) });
  const kapanan = await digerOturumlariSil(kullanici.id, token);
  return Response.json({ tamam: true, kapananOturum: kapanan });
}
