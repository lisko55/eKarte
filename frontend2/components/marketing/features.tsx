import { ShieldCheck, RefreshCw, Smartphone } from "lucide-react";

export function FeaturesSection() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-12 border-t border-slate-100 mt-16">
      <div className="flex flex-col items-center text-center p-4">
        <div className="bg-emerald-100 p-4 rounded-full mb-4">
          <ShieldCheck className="w-8 h-8 text-emerald-600" />
        </div>
        <h3 className="font-bold text-lg mb-2">100% Sigurne Ulaznice</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Svaka ulaznica ima jedinstveni dinamički QR kod koji se ne može
          kopirati. Nema lažnih ulaznica.
        </p>
      </div>

      <div className="flex flex-col items-center text-center p-4">
        <div className="bg-blue-100 p-4 rounded-full mb-4">
          <RefreshCw className="w-8 h-8 text-blue-600" />
        </div>
        <h3 className="font-bold text-lg mb-2">Fair Resale Market</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Ne možete ići? Prodajte ulaznicu drugom fanu sigurno i pošteno.
          Maksimalna cijena je originalna cijena.
        </p>
      </div>

      <div className="flex flex-col items-center text-center p-4">
        <div className="bg-purple-100 p-4 rounded-full mb-4">
          <Smartphone className="w-8 h-8 text-purple-600" />
        </div>
        <h3 className="font-bold text-lg mb-2">Sve na mobitelu</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Zaboravite printanje. Vaše ulaznice su uvijek u vašem džepu, dostupne
          čak i bez interneta.
        </p>
      </div>
    </div>
  );
}
