// POST /api/cikis — oturumu kapat
import { oturumKapat } from "@/lib/oturum";

export async function POST() {
  await oturumKapat();
  return Response.json({ tamam: true });
}
