// DELETE /api/profil/oturumlar — bu cihaz hariç tüm cihazlardan çıkış yap
import { mevcutKullanici, mevcutToken } from "@/lib/oturum";
import { digerOturumlariSil } from "@/lib/veritabani";

export async function DELETE() {
  const kullanici = await mevcutKullanici();
  const token = await mevcutToken();
  if (!kullanici || !token) return Response.json({ hata: "Oturumun kapanmış, tekrar giriş yap." }, { status: 401 });
  const kapanan = await digerOturumlariSil(kullanici.id, token);
  return Response.json({ kapananOturum: kapanan });
}
