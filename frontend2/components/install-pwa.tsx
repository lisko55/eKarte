"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { X, Download, Share } from "lucide-react";

export function InstallPWA() {
  const [supportsPWA, setSupportsPWA] = useState(false);
  const [promptInstall, setPromptInstall] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 1. Provjera je li iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // 2. Slušaj 'beforeinstallprompt' (Android/Desktop)
    const handler = (e: any) => {
      e.preventDefault(); // Spriječi automatski mini-banner
      setPromptInstall(e); // Spremi događaj za kasnije
      setSupportsPWA(true);

      // Prikaži banner nakon 3 sekunde da ne bude napadno
      setTimeout(() => setIsVisible(true), 3000);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // 3. Logika za iOS (Prikaži samo ako nije već instalirano)
    // Provjeravamo 'standalone' mode
    const isStandalone = window.matchMedia(
      "(display-mode: standalone)",
    ).matches;
    if (isIosDevice && !isStandalone) {
      setTimeout(() => setIsVisible(true), 3000);
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstallClick = (e: any) => {
    e.preventDefault();
    if (!promptInstall) {
      return;
    }
    // Pokreni native prompt
    promptInstall.prompt();
  };

  const closeBanner = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-[#0f172a] text-white p-4 rounded-xl shadow-2xl z-50 border border-slate-700 animate-in slide-in-from-bottom-10 fade-in duration-500">
      <button
        onClick={closeBanner}
        className="absolute top-2 right-2 text-slate-400 hover:text-white"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="flex gap-4">
        <div className="bg-white/10 p-3 rounded-lg h-fit">
          <Download className="w-6 h-6 text-blue-400" />
        </div>

        <div className="flex-1">
          <h3 className="font-bold text-sm mb-1">Instaliraj eKarte</h3>

          {isIOS ? (
            // --- PORUKA ZA IPHONE KORISNIKE ---
            <div className="text-xs text-slate-300 space-y-2">
              <p>Za najbolje iskustvo, dodajte aplikaciju na početni zaslon:</p>
              <div className="flex items-center gap-2 bg-slate-800 p-2 rounded">
                <span>1. Klikni</span>
                <Share className="w-4 h-4" />
                <span>(Share)</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-800 p-2 rounded">
                <span>2. Odaberi</span>
                <span className="font-bold">Add to Home Screen</span>
              </div>
            </div>
          ) : (
            // --- GUMB ZA ANDROID / DESKTOP ---
            <div className="space-y-3">
              <p className="text-xs text-slate-300">
                Instalirajte aplikaciju za brži pristup ulaznicama i rad bez
                interneta.
              </p>
              <Button
                onClick={handleInstallClick}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold h-8 text-xs"
              >
                Instaliraj Odmah
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
