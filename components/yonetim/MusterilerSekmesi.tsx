// ─────────────────────────────────────────────────────────────
// MusterilerSekmesi.tsx — Admin panelinde mağazaya üye olan müşterilerin listesi
// ─────────────────────────────────────────────────────────────
"use client";

import { useState } from "react";
import type { Musteri } from "@/lib/musteriler";
import { girdiSinifi } from "./ortak";

const tarih = (iso: string) => new Date(iso).toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" });

export default function MusterilerSekmesi({ musteriler, yayinda }: { musteriler: Musteri[]; yayinda: boolean }) {
  const [arama, setArama] = useState("");
  const a = arama.toLocaleLowerCase("tr");
  const liste = musteriler.filter((m) => m.ad.toLocaleLowerCase("tr").includes(a) || m.eposta.includes(a));

  return (
    <div>
      <h1 className="text-2xl font-bold">Müşteriler</h1>
      <p className="text-sm text-derin/70">
        Mağazana üye olan {musteriler.length} kişi. Bu bilgiler KVKK kapsamında kişisel veridir; sadece sipariş ve iletişim için kullan.
      </p>

      {musteriler.length === 0 ? (
        <div className="mt-6 rounded-2xl border-2 border-dashed border-cizgi bg-kart p-12 text-center">
          <p className="text-4xl">👥</p>
          <p className="mt-3 font-semibold">Henüz üye müşterin yok</p>
          <p className="mx-auto mt-1 max-w-md text-sm text-derin/70">
            {yayinda
              ? "Mağaza sayfandaki “Giriş yap” bağlantısından üye olan müşterilerin burada listelenecek."
              : "Önce Genel bakış sekmesinden siteni yayınla; müşterilerin mağazana üye olabilsin."}
          </p>
        </div>
      ) : (
        <>
          <input value={arama} onChange={(e) => setArama(e.target.value)} placeholder="🔍  İsim veya e-posta ara…" className={`${girdiSinifi} mt-6 max-w-sm`} />
          <div className="mt-4 overflow-x-auto rounded-2xl border border-cizgi bg-kart">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-cizgi text-left text-xs uppercase tracking-wider text-derin/60">
                  <th className="p-4 font-semibold">Müşteri</th>
                  <th className="p-4 font-semibold">Telefon</th>
                  <th className="p-4 font-semibold">Üyelik</th>
                  <th className="p-4 font-semibold">KVKK onayı</th>
                </tr>
              </thead>
              <tbody>
                {liste.map((m) => (
                  <tr key={m.id} className="border-b border-cizgi/60 last:border-0">
                    <td className="p-4">
                      <p className="font-semibold">{m.ad}</p>
                      <a href={`mailto:${m.eposta}`} className="text-xs text-deniz hover:underline">
                        {m.eposta}
                      </a>
                    </td>
                    <td className="whitespace-nowrap p-4 text-derin">{m.telefon ?? "—"}</td>
                    <td className="whitespace-nowrap p-4 text-derin">{tarih(m.kayitTarihi)}</td>
                    <td className="whitespace-nowrap p-4">
                      <span className="rounded-full bg-nane px-2.5 py-1 text-xs font-semibold text-derin">✓ {tarih(m.kvkkOnayTarihi)}</span>
                    </td>
                  </tr>
                ))}
                {liste.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-derin/60">
                      Aramana uygun müşteri bulunamadı.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
