// Süper admin panelindeki küçük formlar için ortak kabuk:
// sunucu işlemini çalıştırır, beklerken kilitler, sonucu altında gösterir.
"use client";

import { useActionState } from "react";
import type { IslemSonucu } from "@/app/admin/islemler";

export default function IslemFormu({
  islem,
  children,
  className = "",
  onayMetni,
}: {
  islem: (onceki: IslemSonucu, f: FormData) => Promise<IslemSonucu>;
  children: React.ReactNode;
  className?: string;
  onayMetni?: string; // varsa göndermeden önce "emin misin?" sorulur
}) {
  const [sonuc, gonder, bekliyor] = useActionState(islem, null);
  return (
    <form
      action={gonder}
      onSubmit={(e) => {
        if (onayMetni && !confirm(onayMetni)) e.preventDefault();
      }}
      className={className}
    >
      <fieldset disabled={bekliyor} className="contents">
        {children}
      </fieldset>
      {bekliyor && <span className="text-xs text-derin/60">İşleniyor…</span>}
      {sonuc && !bekliyor && (
        <span className={`text-xs font-medium ${sonuc.tur === "basari" ? "text-emerald-700" : "text-rose-700"}`}>{sonuc.mesaj}</span>
      )}
    </form>
  );
}
