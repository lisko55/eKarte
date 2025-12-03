"use client";

import { useState, useEffect } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { validateTicketScan } from "@/actions/ticket-actions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, RefreshCw, Camera } from "lucide-react";
import { toast } from "sonner";

export default function ScannerPage() {
  const [data, setData] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<any>(null);
  const [isScanning, setIsScanning] = useState(true);
  const [processing, setProcessing] = useState(false);

  // Funkcija koja se poziva kad kamera nešto uhvati
  const handleScan = async (result: string) => {
    if (result && !processing) {
      setProcessing(true);
      setIsScanning(false); // Pauziraj kameru dok provjeravamo
      setData(result);

      try {
        // Pozovi backend
        const res = await validateTicketScan(result);
        setScanResult(res);

        if (res.valid) {
          // Dodajemo timestamp (?t=...) da prisilimo preglednik da skine novi zvuk
          const audio = new Audio(`/success.mp3?t=${new Date().getTime()}`);
          audio.play().catch((e) => console.log("Audio error:", e));
        } else {
          // Isto i za error
          const audio = new Audio(`/error.mp3?t=${new Date().getTime()}`);
          audio.play().catch((e) => console.log("Audio error:", e));
        }
      } catch (error) {
        toast.error("Greška pri komunikaciji sa serverom.");
        setScanResult({ error: "Greška mreže", valid: false });
      }

      setProcessing(false);
    }
  };

  const resetScanner = () => {
    setData(null);
    setScanResult(null);
    setIsScanning(true);
    setProcessing(false);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Camera className="w-6 h-6" /> Kontrola Ulaza
      </h1>

      <div className="w-full max-w-md relative overflow-hidden rounded-3xl border-4 border-slate-800 bg-slate-900 shadow-2xl">
        {/* KAMERA */}
        {isScanning && (
          <div className="relative aspect-square">
            <Scanner
              onScan={(result) => {
                if (result && result.length > 0) {
                  handleScan(result[0].rawValue);
                }
              }}
              components={{
                torch: true, // Dozvoli bljeskalicu
              }}
              styles={{
                container: { width: "100%", height: "100%" },
              }}
            />
            {/* Overlay okvir */}
            <div className="absolute inset-0 border-[30px] border-black/50 pointer-events-none flex items-center justify-center">
              <div className="w-48 h-48 border-2 border-white/50 rounded-lg animate-pulse"></div>
            </div>
            <p className="absolute bottom-4 left-0 right-0 text-center text-sm font-bold text-white/80 drop-shadow-md">
              Skeniraj QR kod
            </p>
          </div>
        )}

        {/* REZULTAT SKENIRANJA */}
        {!isScanning && scanResult && (
          <div
            className={`aspect-square flex flex-col items-center justify-center p-6 text-center ${
              scanResult.valid ? "bg-emerald-600" : "bg-red-600"
            }`}
          >
            {scanResult.valid ? (
              <>
                <CheckCircle className="w-24 h-24 text-white mb-4 animate-in zoom-in duration-300" />
                <h2 className="text-3xl font-extrabold text-white mb-2">
                  DOZVOLJEN ULAZ
                </h2>
                <div className="bg-white/20 p-4 rounded-xl w-full backdrop-blur-sm">
                  <p className="text-emerald-100 text-xs uppercase tracking-widest font-semibold">
                    Gost
                  </p>
                  <p className="text-white text-xl font-bold mb-2">
                    {scanResult.ticketData.ownerName}
                  </p>
                  <p className="text-emerald-100 text-xs uppercase tracking-widest font-semibold">
                    Tip
                  </p>
                  <p className="text-white text-lg">
                    {scanResult.ticketData.eventName}
                  </p>
                  <p className="text-white font-bold">
                    {scanResult.ticketData.type}
                  </p>
                </div>
              </>
            ) : (
              <>
                <XCircle className="w-24 h-24 text-white mb-4 animate-in shake duration-300" />
                <h2 className="text-3xl font-extrabold text-white mb-2">
                  ULAZ ODBIJEN
                </h2>
                <div className="bg-black/20 p-4 rounded-xl w-full">
                  <p className="text-white font-mono text-lg font-bold">
                    {scanResult.error}
                  </p>
                  {scanResult.ticketData && (
                    <p className="text-sm text-red-200 mt-2">
                      Vlasnik:{" "}
                      <span className="font-bold">
                        {scanResult.ticketData.ownerName}
                      </span>
                    </p>
                  )}
                </div>
              </>
            )}

            <Button
              onClick={resetScanner}
              className="mt-8 bg-white text-black hover:bg-slate-200 w-full font-bold text-lg h-14 rounded-xl shadow-lg"
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              Skeniraj sljedeći
            </Button>
          </div>
        )}
      </div>

      <p className="text-slate-500 text-xs mt-8">eKarte Admin Scanner v1.0</p>
    </div>
  );
}
