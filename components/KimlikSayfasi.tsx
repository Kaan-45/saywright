// Kayıt ve giriş sayfalarının ortak düzeni: solda form, sağda tanıtım paneli
import Logo from "./Logo";
import KimlikFormu from "./KimlikFormu";
import MisafirButonu from "./MisafirButonu";
import { demoModu } from "@/lib/demo";

export default function KimlikSayfasi({ tur }: { tur: "kayit" | "giris" }) {
  return (
    <main className="grid min-h-screen bg-zemin text-gece lg:grid-cols-2">
      <div className="flex flex-col px-6 py-6 sm:px-12">
        <Logo />
        <div className="flex flex-1 items-center justify-center py-12">
          <div className="w-full max-w-sm">
            <KimlikFormu tur={tur} />
            {demoModu() && (
              <div className="mt-6 border-t border-cizgi pt-6 text-center">
                <p className="mb-3 text-sm text-derin/70">Hesap açmadan bakmak mı istiyorsun?</p>
                <MisafirButonu className="w-full rounded-xl border-2 border-gece px-4 py-2.5 text-sm font-semibold text-gece transition hover:bg-nane/50" />
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="relative hidden overflow-hidden bg-gece lg:flex lg:items-center lg:justify-center">
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-deniz/40 blur-3xl" />
        <div className="absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-derin blur-3xl" />
        <div className="relative max-w-md px-10 text-white">
          <p className="text-3xl font-bold leading-tight">“Mağazamı anlattım, bir dakika sonra sitem hazırdı.”</p>
          <p className="mt-4 text-white/70">Kod yok, tasarımcı yok, bekleme yok. Sadece ne istediğini yaz.</p>
          <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
            <p className="text-sm text-nane">Örnek istek</p>
            <p className="mt-1 font-medium">“El yapımı seramik satıyorum, sade ve doğal tonlarda bir site istiyorum.”</p>
          </div>
        </div>
      </div>
    </main>
  );
}
