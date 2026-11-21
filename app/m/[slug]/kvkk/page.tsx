// ─────────────────────────────────────────────────────────────
// /m/[adres]/kvkk — Mağazanın KVKK aydınlatma metni (ŞABLON)
// ⚠️ Bu metin genel bir taslaktır. Yayına çıkmadan önce bir avukata kontrol ettirilmeli
// ve mağaza sahibinin gerçek bilgileriyle (unvan, adres, iletişim) güncellenmelidir.
// ─────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import MagazaCercevesi from "@/components/magaza/MagazaCercevesi";
import { yayindakiMagaza } from "@/lib/magazalar";

export const metadata: Metadata = { title: "KVKK Aydınlatma Metni" };

export default function Sayfa({ params }: PageProps<"/m/[slug]/kvkk">) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-50" />}>
      <Icerik params={params} />
    </Suspense>
  );
}

async function Icerik({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const magaza = await yayindakiMagaza(slug);
  if (!magaza) notFound();
  const ad = magaza.ayarlar.magazaAdi;

  const bolumler: [string, string][] = [
    ["Veri sorumlusu", `Kişisel verileriniz, veri sorumlusu sıfatıyla ${ad} tarafından 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") kapsamında işlenmektedir. Site altyapısı Saywright tarafından, veri işleyen sıfatıyla sağlanmaktadır.`],
    ["İşlenen veriler", "Ad soyad, e-posta adresi, telefon numarası (verirseniz), sipariş ve teslimat bilgileri ile güvenlik amacıyla tutulan oturum kayıtları."],
    ["İşleme amaçları", "Üyelik hesabınızın oluşturulması ve yönetilmesi, siparişlerinizin alınması ve teslim edilmesi, sizinle iletişim kurulması, yasal yükümlülüklerin yerine getirilmesi ve hesap güvenliğinin sağlanması."],
    ["Hukuki sebep", "KVKK md. 5 kapsamında sözleşmenin kurulması ve ifası, hukuki yükümlülüklerin yerine getirilmesi ile açık rızanız."],
    ["Aktarım", "Verileriniz yalnızca hizmetin sunulması için gerekli olduğu ölçüde altyapı sağlayıcıları (barındırma, veritabanı) ve kargo/ödeme kuruluşlarıyla paylaşılabilir. Altyapı sağlayıcılarının sunucuları yurt dışında (Avrupa Birliği) bulunabilir."],
    ["Saklama süresi", "Verileriniz hesabınız açık olduğu sürece ve ilgili mevzuatın öngördüğü süreler boyunca saklanır. Hesabınızı sildiğinizde üyelik verileriniz silinir."],
    ["Haklarınız", "KVKK md. 11 uyarınca verilerinizin işlenip işlenmediğini öğrenme, düzeltilmesini veya silinmesini isteme, itiraz etme ve zararın giderilmesini talep etme haklarına sahipsiniz. Hesabınızı ve verilerinizi “Hesabım” sayfasından kendiniz silebilirsiniz."],
  ];

  return (
    <MagazaCercevesi ayarlar={magaza.ayarlar} slug={slug} genis>
      <article className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-black/5">
        <h1 className="text-2xl font-bold">KVKK Aydınlatma Metni</h1>
        <p className="mt-1 text-sm text-zinc-500">{ad} üyelik ve sipariş işlemleri</p>
        <div className="mt-8 space-y-6">
          {bolumler.map(([baslik, metin], i) => (
            <section key={baslik}>
              <h2 className="font-semibold">
                {i + 1}. {baslik}
              </h2>
              <p className="mt-1.5 leading-relaxed text-zinc-700">{metin}</p>
            </section>
          ))}
        </div>
        <p className="mt-10 rounded-xl bg-zinc-50 p-4 text-xs text-zinc-500">
          Bu metin genel bir şablondur. Mağaza sahibinin unvanı, adresi ve iletişim bilgileriyle güncellenmesi önerilir.
        </p>
      </article>
    </MagazaCercevesi>
  );
}
