// POST /api/giris — e-posta + şifre ile giriş
import { oturumAc, sifreDogruMu } from "@/lib/oturum";
import { kullaniciBulEposta } from "@/lib/veritabani";

export async function POST(istek: Request) {
  const { eposta, sifre } = (await istek.json()) as Record<string, string>;
  const kullanici = await kullaniciBulEposta(String(eposta ?? "").trim().toLowerCase());

  // "E-posta yok" ile "şifre yanlış" için AYNI mesajı veriyoruz;
  // böylece kötü niyetli biri hangi e-postaların kayıtlı olduğunu öğrenemez.
  if (!kullanici || !sifreDogruMu(String(sifre ?? ""), kullanici.sifreHash))
    return Response.json({ hata: "E-posta veya şifre hatalı." }, { status: 401 });

  await oturumAc(kullanici.id);
  return Response.json({ tamam: true });
}
