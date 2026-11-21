// app/admin/page.tsx — Süper admin: genel bakış (sayılar + bekleyen talepler)
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { SayfaBasligi, icerik, tarih, tl } from "@/components/admin/ortak";
import { adminKullanici, istatistikler } from "@/lib/admin";
import { talepleriListele } from "@/lib/yayinTalepleri";

export default function AdminGenelBakis() {
  return (
    <Suspense fallback={<div className={icerik}>Yükleniyor…</div>}>
      <Icerik />
    </Suspense>
  );
}

function Kutu({ etiket, deger, alt, vurgu }: { etiket: string; deger: string | number; alt?: string; vurgu?: boolean }) {
  return (
    <div className={`rounded-2xl border p-5 ${vurgu ? "border-amber-300 bg-amber-50" : "border-cizgi bg-kart"}`}>
      <p className="text-xs font-semibold uppercase tracking-wider text-derin/70">{etiket}</p>
      <p className="mt-2 text-3xl font-extrabold">{deger}</p>
      {alt && <p className="mt-1 text-xs text-derin/70">{alt}</p>}
    </div>
  );
}

async function Icerik() {
  if (!(await adminKullanici())) notFound();
  const s = await istatistikler();
  const bekleyenler = (await talepleriListele()).filter((r) => r.talep.durum === "bekliyor").slice(0, 5);

  return (
    <main className={icerik}>
      <SayfaBasligi baslik="Genel bakış" aciklama="Saywright'taki tüm hareketin özeti." />

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kutu etiket="Bekleyen talep" deger={s.talep.bekleyen} alt="Onayını bekleyen yayınlar" vurgu={s.talep.bekleyen > 0} />
        <Kutu etiket="Kullanıcı" deger={s.kullanici.toplam} alt={`Son 7 günde +${s.kullanici.sonHafta}`} />
        <Kutu etiket="Site" deger={s.site.toplam} alt={`${s.site.yayinda} tanesi yayında`} />
        <Kutu etiket="Saywright kazancı" deger={tl(s.talep.kazancKurus)} alt="Onaylanan paket ödemeleri" />
        <Kutu etiket="Paketler" deger={`${s.kullanici.pro} Pro`} alt={`${s.kullanici.ucretsiz} Keşfet · ${s.kullanici.isletme} Tam Hizmet`} />
        <Kutu etiket="Mağaza siparişi" deger={s.siparis.toplam} alt="Tüm mağazalarda" />
        <Kutu etiket="Mağaza cirosu" deger={tl(s.siparis.ciroKurus)} alt="İptaller hariç" />
        <Kutu etiket="Yapay zeka mesajı" deger={s.site.yapayZekaMesaji} alt="Claude faturasının kaynağı" />
      </div>

      <section className="mt-10 rounded-3xl border border-cizgi bg-kart p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-semibold">📥 Bekleyen yayın talepleri</h2>
          <Link href="/admin/talepler" className="text-sm font-semibold text-deniz hover:underline">
            Tümünü gör →
          </Link>
        </div>
        {bekleyenler.length === 0 ? (
          <p className="mt-4 text-sm text-derin/70">Bekleyen talep yok. 🎉</p>
        ) : (
          <ul className="mt-4 divide-y divide-cizgi">
            {bekleyenler.map((r) => (
              <li key={r.talep.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                <span>
                  <b>{r.magazaAdi ?? "Adsız site"}</b> · {r.kullaniciAd}
                  {r.talep.alanAdi && <span className="text-derin/70"> · 🌐 {r.talep.alanAdi}</span>}
                </span>
                <span className="text-xs text-derin/70">
                  {r.talep.tutarKurus > 0 ? `💳 ${tl(r.talep.tutarKurus)} · ${r.talep.odemeKodu}` : "Ödeme yok"} · {tarih(r.talep.olusturma)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
