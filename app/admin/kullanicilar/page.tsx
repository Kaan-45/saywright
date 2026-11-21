// app/admin/kullanicilar/page.tsx — Süper admin: kullanıcılar (arama + paket değiştirme)
import { notFound } from "next/navigation";
import { Suspense } from "react";
import IslemFormu from "@/components/admin/IslemFormu";
import { SayfaBasligi, dugme, icerik, tarih } from "@/components/admin/ortak";
import { adminKullanici, tumKullanicilar } from "@/lib/admin";
import { PLANLAR, type PlanKodu } from "@/lib/planlar";
import { planDegistir } from "../islemler";

export default function KullanicilarSayfasi({ searchParams }: PageProps<"/admin/kullanicilar">) {
  return (
    <Suspense fallback={<div className={icerik}>Yükleniyor…</div>}>
      <Icerik searchParams={searchParams} />
    </Suspense>
  );
}

async function Icerik({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  if (!(await adminKullanici())) notFound();
  const q = (await searchParams).q;
  const arama = typeof q === "string" ? q : "";
  const liste = await tumKullanicilar(arama);

  return (
    <main className={icerik}>
      <SayfaBasligi baslik="Kullanıcılar" aciklama="Saywright'a kayıtlı site sahipleri. Havale gelince paketi buradan da değiştirebilirsin." />

      <form className="mt-6 flex gap-2">
        <input
          name="q"
          defaultValue={arama}
          placeholder="Ad veya e-posta ara…"
          className="min-w-0 flex-1 rounded-xl border border-cizgi bg-white px-4 py-2.5 text-sm outline-none focus:border-deniz focus:ring-4 focus:ring-nane"
        />
        <button className="rounded-xl bg-gece px-5 text-sm font-semibold text-white hover:bg-derin">Ara</button>
      </form>

      <div className="mt-4 overflow-x-auto rounded-2xl border border-cizgi bg-kart">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead className="border-b border-cizgi text-xs uppercase tracking-wider text-derin/70">
            <tr>
              <th className="px-4 py-3">Kullanıcı</th>
              <th className="px-4 py-3">Kayıt</th>
              <th className="px-4 py-3">Site</th>
              <th className="px-4 py-3">Yapay zeka mesajı</th>
              <th className="px-4 py-3">Paket</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cizgi">
            {liste.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-derin/60">
                  Kullanıcı bulunamadı.
                </td>
              </tr>
            )}
            {liste.map((k) => (
              <tr key={k.id}>
                <td className="px-4 py-3">
                  <p className="font-medium">
                    {k.ad} {k.rol === "admin" && <span className="ml-1 rounded bg-gece px-1.5 py-0.5 text-[10px] font-bold text-nane">ADMIN</span>}
                  </p>
                  <p className="text-xs text-derin/70">{k.eposta}</p>
                </td>
                <td className="px-4 py-3 text-xs text-derin/70">{tarih(k.kayitTarihi)}</td>
                <td className="px-4 py-3">{k.siteSayisi}</td>
                <td className="px-4 py-3">{k.yapayZekaMesaji}</td>
                <td className="px-4 py-3">
                  <IslemFormu islem={planDegistir} className="flex flex-wrap items-center gap-2">
                    <input type="hidden" name="kullaniciId" value={k.id} />
                    <select name="plan" defaultValue={k.plan} className="rounded-lg border border-cizgi bg-white px-2 py-1.5 text-sm">
                      {(Object.keys(PLANLAR) as PlanKodu[]).map((p) => (
                        <option key={p} value={p}>
                          {PLANLAR[p].ad}
                        </option>
                      ))}
                    </select>
                    <button className={`${dugme} border border-cizgi bg-white hover:bg-zemin`}>Kaydet</button>
                  </IslemFormu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
