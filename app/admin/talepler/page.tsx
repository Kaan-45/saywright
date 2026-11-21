// app/admin/talepler/page.tsx — Süper admin: yayın talepleri (onayla / reddet)
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import IslemFormu from "@/components/admin/IslemFormu";
import { SayfaBasligi, TalepRozeti, dugme, icerik, tarih, tl } from "@/components/admin/ortak";
import { adminKullanici } from "@/lib/admin";
import { PLANLAR } from "@/lib/planlar";
import { talepleriListele } from "@/lib/yayinTalepleri";
import { talebiOnayla, talebiReddet } from "../islemler";

export default function TaleplerSayfasi() {
  return (
    <Suspense fallback={<div className={icerik}>Yükleniyor…</div>}>
      <Icerik />
    </Suspense>
  );
}

async function Icerik() {
  if (!(await adminKullanici())) notFound();
  const liste = await talepleriListele();
  const bekleyen = liste.filter((r) => r.talep.durum === "bekliyor");
  const gecmis = liste.filter((r) => r.talep.durum !== "bekliyor");

  return (
    <main className={icerik}>
      <SayfaBasligi
        baslik="Yayın talepleri"
        aciklama="Ödemeyi ve sitenin içeriğini kontrol et, sonra onayla. Onayda paket yükselir ve site otomatik yayına girer."
      />

      <h2 className="mt-8 text-sm font-bold uppercase tracking-widest text-derin/70">Bekleyenler ({bekleyen.length})</h2>
      {bekleyen.length === 0 && <p className="mt-3 rounded-2xl border border-dashed border-cizgi p-8 text-center text-sm text-derin/70">Bekleyen talep yok.</p>}
      <div className="mt-3 space-y-4">
        {bekleyen.map(({ talep: t, ...r }) => (
          <article key={t.id} className="rounded-3xl border border-amber-300 bg-kart p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-bold">{r.magazaAdi ?? "Adsız site"}</h3>
                  <TalepRozeti durum={t.durum} />
                </div>
                <p className="mt-0.5 text-sm text-derin/80">
                  {r.kullaniciAd} · {r.kullaniciEposta} · şu an {PLANLAR[r.kullaniciPlan].ad}
                </p>
              </div>
              <Link href={`/admin/onizleme/${t.siteId}`} target="_blank" className="rounded-xl border border-cizgi bg-white px-4 py-2 text-sm font-semibold hover:bg-zemin">
                👁️ Siteyi incele ↗
              </Link>
            </div>

            <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
              <Bilgi etiket="Saywright adresi" deger={`/m/${t.slug}`} />
              <Bilgi
                etiket="Alan adı"
                deger={t.alanAdi ? `${t.alanAdi} (${t.alanAdiTuru === "mevcut" ? "müşterinin, bağlanacak" : "satın alınacak"})` : "İstemiyor"}
              />
              <Bilgi etiket="Ödeme" deger={t.tutarKurus > 0 ? `${tl(t.tutarKurus)} havale · kod ${t.odemeKodu}` : "Gerekmiyor"} vurgu={t.tutarKurus > 0} />
              <Bilgi etiket="Gönderilme" deger={`${tarih(t.olusturma)} · ${r.urunSayisi} ürün`} />
            </dl>
            {t.istenenPlan && (
              <p className="mt-3 text-xs text-derin/80">
                Onaylarsan kullanıcının paketi <b>{PLANLAR[t.istenenPlan].ad}</b> olur. Önce banka hesabında <b>{t.odemeKodu}</b> açıklamalı{" "}
                {tl(t.tutarKurus)} ödemeyi gördüğünden emin ol.
              </p>
            )}

            <div className="mt-5 grid gap-3 border-t border-cizgi pt-5 lg:grid-cols-2">
              <IslemFormu islem={talebiOnayla} className="flex flex-wrap items-center gap-2" onayMetni="Talep onaylanıp site yayına alınacak. Emin misin?">
                <input type="hidden" name="talepId" value={t.id} />
                <input name="not" placeholder="İç not (isteğe bağlı)" className="min-w-0 flex-1 rounded-lg border border-cizgi bg-white px-3 py-2 text-sm" />
                <button className={`${dugme} bg-emerald-600 py-2 text-white hover:bg-emerald-700`}>✓ Onayla ve yayınla</button>
              </IslemFormu>
              <IslemFormu islem={talebiReddet} className="flex flex-wrap items-center gap-2">
                <input type="hidden" name="talepId" value={t.id} />
                <input
                  name="sebep"
                  required
                  minLength={5}
                  placeholder="Ret sebebi (müşteri görür)"
                  className="min-w-0 flex-1 rounded-lg border border-cizgi bg-white px-3 py-2 text-sm"
                />
                <button className={`${dugme} bg-rose-50 py-2 text-rose-700 hover:bg-rose-100`}>✕ Reddet</button>
              </IslemFormu>
            </div>
          </article>
        ))}
      </div>

      <h2 className="mt-10 text-sm font-bold uppercase tracking-widest text-derin/70">Geçmiş</h2>
      <div className="mt-3 overflow-x-auto rounded-2xl border border-cizgi bg-kart">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-cizgi text-xs uppercase tracking-wider text-derin/70">
            <tr>
              <th className="px-4 py-3">Mağaza</th>
              <th className="px-4 py-3">Sahibi</th>
              <th className="px-4 py-3">Alan adı</th>
              <th className="px-4 py-3">Tutar</th>
              <th className="px-4 py-3">Durum</th>
              <th className="px-4 py-3">Karar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cizgi">
            {gecmis.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-derin/60">
                  Henüz sonuçlanmış talep yok.
                </td>
              </tr>
            )}
            {gecmis.map(({ talep: t, ...r }) => (
              <tr key={t.id}>
                <td className="px-4 py-3 font-medium">{r.magazaAdi ?? "Adsız"}</td>
                <td className="px-4 py-3">{r.kullaniciEposta}</td>
                <td className="px-4 py-3">{t.alanAdi ?? "—"}</td>
                <td className="px-4 py-3">{t.tutarKurus ? tl(t.tutarKurus) : "—"}</td>
                <td className="px-4 py-3">
                  <TalepRozeti durum={t.durum} />
                  {t.adminNotu && <p className="mt-1 max-w-xs text-xs text-derin/70">{t.adminNotu}</p>}
                </td>
                <td className="px-4 py-3 text-xs text-derin/70">{t.kararTarihi ? tarih(t.kararTarihi) : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}

function Bilgi({ etiket, deger, vurgu }: { etiket: string; deger: string; vurgu?: boolean }) {
  return (
    <div className={`rounded-xl p-3 ${vurgu ? "bg-amber-50" : "bg-white/70"}`}>
      <dt className="text-xs text-derin/70">{etiket}</dt>
      <dd className="mt-0.5 break-all font-medium">{deger}</dd>
    </div>
  );
}
