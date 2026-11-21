// POST /m/[adres]/api/cikis — mağaza müşterisi çıkışı
import { musteriOturumKapat } from "@/lib/musteriler";

export async function POST(_: Request, ctx: RouteContext<"/m/[slug]/api/cikis">) {
  await musteriOturumKapat((await ctx.params).slug);
  return Response.json({ tamam: true });
}
