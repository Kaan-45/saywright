// app/admin/siteler/page.tsx — Süper admin: tüm siteler (alan adı bağlama, yayından kaldırma)
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import IslemFormu from "@/components/admin/IslemFormu";
import { SayfaBasligi, dugme, icerik, tarih } from "@/components/admin/ortak";
import { adminKullanici, tumSiteler } from "@/lib/admin";
import { PLANLAR } from "@/lib/planlar";
import { alanAdiKaydet, siteyiAskiyaAl } from "../islemler";

export default function SitelerSayfasi() {
  return (
    <Suspense fallback={<div className={icerik}>Yükleniyor…</div>}>
      <Icerik />
    </Suspense>
  );
}

async function Icerik() {
  if (!(await adminKullanici())) notFound();
  const liste = await tumSiteler();

  return (
    <main className={icerik}>
      <SayfaBasligi
        baslik="Siteler"
        aciklama="Tüm mağazalar. Alan adını satın alıp bağladığında buraya yaz; sorunlu bir siteyi yayından kaldırabilirsin."
      />

      <div className="mt-6 overflow-x-auto rounded-2xl border border-cizgi bg-kart">
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead className="border-b border-cizgi text-xs uppercase tracking-wider text-derin/70">
            <tr>
              <th className="px-4 py-3">Mağaza</th>
              <th className="px-4 py-3">Sahibi</th>
              <th className="px-4 py-3">Durum</th>
              <th className="px-4 py-3">Mesaj / Sipariş</th>
              <th className="px-4 py-3">Bağlı alan adı</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cizgi">
            {liste.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-derin/60">
                  Henüz site yok.
                </td>
              </tr>
            )}
            {liste.map((s) => (
              <tr key={s.id} className="align-top">
                <td className="px-4 py-3">
                  <p className="font-medium">{s.magazaAdi ?? "Adsız site"}</p>
                  {s.slug && <p className="text-xs text-derin/70">/m/{s.slug}</p>}
                  <p className="text-[11px] text-derin/50">{tarih(s.guncelleme)}</p>
                </td>
                <td className="px-4 py-3">
                  <p>{s.sahipAd}</p>
                  <p className="text-xs text-derin/70">
                    {s.sahipEposta} · {PLANLAR[s.sahipPlan].ad}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                      s.yayinda ? "bg-emerald-100 text-emerald-800" : s.yayinOnayi ? "bg-nane text-gece" : "bg-zemin text-derin"
                    }`}
                  >
                    {s.yayinda ? "● Yayında" : s.yayinOnayi ? "Onaylı, kapalı" : "Taslak"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {s.yapayZekaMesajSayisi} / {s.siparisSayisi}
                </td>
                <td className="px-4 py-3">
                  {s.yayinOnayi ? (
                    <IslemFormu islem={alanAdiKaydet} className="flex flex-wrap items-center gap-2">
                      <input type="hidden" name="siteId" value={s.id} />
                      <input
                        name="alanAdi"
                        defaultValue={s.alanAdi ?? ""}
                        placeholder="abc.com"
                        className="w-36 rounded-lg border border-cizgi bg-white px-2 py-1.5 text-sm"
                      />
                      <button className={`${dugme} border border-cizgi bg-white hover:bg-zemin`}>Kaydet</button>
                    </IslemFormu>
                  ) : (
                    <span className="text-xs text-derin/50">Önce yayın onayı</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {s.magazaAdi && (
                      <Link href={`/admin/onizleme/${s.id}`} target="_blank" className={`${dugme} border border-cizgi bg-white hover:bg-zemin`}>
                        👁️ İncele
                      </Link>
                    )}
                    {s.yayinOnayi && (
                      <IslemFormu
                        islem={siteyiAskiyaAl}
                        className="flex items-center gap-2"
                        onayMetni="Site yayından kaldırılacak ve onayı geri alınacak. Sahibi yeniden talep göndermek zorunda kalacak. Emin misin?"
                      >
                        <input type="hidden" name="siteId" value={s.id} />
                        <button className={`${dugme} text-rose-700 hover:bg-rose-50`}>Yayından kaldır</button>
                      </IslemFormu>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-derin/60">
        Not: Bağlı alan adının gerçekten çalışması için site Vercel&apos;e yüklendikten sonra alan adının Vercel projesine de eklenmesi gerekir.
      </p>
    </main>
  );
}
