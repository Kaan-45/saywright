// Panelde bir siteyi (projeyi) gösteren kart: küçük önizleme, bilgiler ve butonlar
import Link from "next/link";
import MagazaSablonu from "@/templates/magaza/MagazaSablonu";
import type { Site } from "@/lib/veritabani";

export default function SiteKarti({ site, mesajSiniri, adminAcik }: { site: Site; mesajSiniri: number; adminAcik: boolean }) {
  const a = site.ayarlar;
  const kullanim = Math.min(100, (site.yapayZekaMesajSayisi / mesajSiniri) * 100);

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-cizgi bg-kart transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-gece/10">
      <Link href={`/olustur/${site.id}`} className="relative block h-44 overflow-hidden border-b border-cizgi bg-white">
        {a ? (
          <div className="pointer-events-none" style={{ width: "300%", transform: "scale(0.3333)", transformOrigin: "top left" }}>
            <MagazaSablonu ayarlar={a} />
          </div>
        ) : (
          <div className="grid h-full place-items-center bg-zemin/60 text-center">
            <div>
              <p className="text-3xl">🪄</p>
              <p className="mt-1 text-xs text-derin/70">Henüz anlatılmadı</p>
            </div>
          </div>
        )}
        <span
          className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
            site.yayinda ? "bg-emerald-600 text-white" : a ? "bg-gece text-nane" : "bg-amber-100 text-amber-800"
          }`}
        >
          {site.yayinda ? "● Yayında" : a ? "● Taslak hazır" : "○ Başlanmadı"}
        </span>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <p className="font-semibold">{a?.magazaAdi ?? "Adsız site"}</p>
          {a && (
            <span className="shrink-0 rounded-md px-2 py-0.5 text-[11px] font-medium" style={{ background: a.renk.acik, color: a.renk.ana }}>
              {a.urunler.length} ürün
            </span>
          )}
        </div>
        <p className="mt-0.5 line-clamp-1 text-xs text-derin/70">{a?.slogan ?? "Sohbet ekranında siteni anlatmaya başla."}</p>

        <div className="mt-4">
          <div className="flex justify-between text-[11px] text-derin/70">
            <span>Yapay zeka mesajı</span>
            <span>
              {site.yapayZekaMesajSayisi} / {mesajSiniri}
            </span>
          </div>
          <div className="mt-1 h-1.5 rounded-full bg-nane/60">
            <div className="h-1.5 rounded-full bg-deniz" style={{ width: `${kullanim}%` }} />
          </div>
        </div>
        {site.yayinda && site.slug && (
          <a
            href={`/m/${site.slug}`}
            target="_blank"
            rel="noreferrer"
            className="mt-3 flex items-center gap-1.5 truncate rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-medium text-emerald-800 hover:bg-emerald-100"
          >
            🌐 /m/{site.slug} ↗
          </a>
        )}
        <p className="mt-3 text-[11px] text-derin/60">
          Son güncelleme: {new Date(site.guncelleme).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}
        </p>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <Link
            href={`/olustur/${site.id}`}
            className="rounded-xl border border-cizgi bg-white/60 py-2 text-center text-xs font-semibold hover:bg-nane/50"
          >
            💬 Sohbetle düzenle
          </Link>
          {adminAcik && a ? (
            <Link href={`/yonetim/${site.id}`} className="rounded-xl bg-gece py-2 text-center text-xs font-semibold text-white hover:bg-derin">
              ⚙️ Admin paneli
            </Link>
          ) : (
            <span
              title={adminAcik ? "Önce sohbetle sitenin ilk halini oluştur" : "Pro pakete özel"}
              className="cursor-not-allowed rounded-xl bg-zemin py-2 text-center text-xs font-semibold text-derin/50"
            >
              {adminAcik ? "⚙️ Admin paneli" : "🔒 Admin paneli"}
            </span>
          )}
        </div>
        {a && !site.yayinOnayi && (
          <Link
            href={`/panel/yayinla/${site.id}`}
            className="mt-2 rounded-xl bg-deniz py-2 text-center text-xs font-semibold text-white hover:bg-derin"
          >
            🚀 Yayınla
          </Link>
        )}
      </div>
    </div>
  );
}
