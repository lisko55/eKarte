"use client";

import { useEffect, useState } from "react";
import * as OTPAuth from "otpauth";
import { QRCodeSVG } from "qrcode.react";
import { Progress } from "@/components/ui/progress";
import { ShieldCheck, Wifi, WifiOff } from "lucide-react";

interface SecureTicketProps {
  secret: string;
  ticketId: string;
}

export function SecureTicket({ secret, ticketId }: SecureTicketProps) {
  const [token, setToken] = useState("");
  const [timeLeft, setTimeLeft] = useState(30);
  const [isOnline, setIsOnline] = useState(true);

  // Provjera online statusa (čisto vizualno)
  useEffect(() => {
    setIsOnline(navigator.onLine);
    window.addEventListener("online", () => setIsOnline(true));
    window.addEventListener("offline", () => setIsOnline(false));
    return () => {
      window.removeEventListener("online", () => setIsOnline(true));
      window.removeEventListener("offline", () => setIsOnline(false));
    };
  }, []);

  // TOTP Logika
  useEffect(() => {
    if (!secret) return;

    const totp = new OTPAuth.TOTP({
      issuer: "eKarte",
      label: "Ticket",
      algorithm: "SHA1",
      digits: 6,
      period: 30,
      secret: OTPAuth.Secret.fromHex(secret),
    });

    const updateToken = () => {
      const code = totp.generate();
      // Format QR koda: TICKET_ID : VREMENSKI_KOD
      setToken(`${ticketId}:${code}`);

      const seconds = new Date().getSeconds();
      setTimeLeft(30 - (seconds % 30));
    };

    updateToken();
    const interval = setInterval(updateToken, 1000);
    return () => clearInterval(interval);
  }, [secret, ticketId]);

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-xl border border-slate-200 relative overflow-hidden w-full max-w-sm mx-auto">
      {/* Animacija pozadine (Shimmer) */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-blue-50/30 to-transparent animate-pulse pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center w-full">
        {/* Header */}
        <div className="mb-6 flex items-center gap-2 text-emerald-600 bg-emerald-50 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">
          <ShieldCheck className="w-4 h-4" />
          Sigurna Ulaznica
        </div>

        {/* QR Kod Okvir */}
        <div className="bg-white p-4 rounded-2xl border-2 border-slate-900 shadow-sm relative">
          <QRCodeSVG value={token} size={220} level="H" />

          {/* Logo u sredini (opcionalno) */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md">
              <ShieldCheck className="w-6 h-6 text-slate-900" />
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full mt-8 space-y-2 px-4">
          <div className="flex justify-between text-xs text-slate-400 font-mono">
            <span>Osvježavanje koda</span>
            <span>{timeLeft}s</span>
          </div>
          <Progress
            value={(timeLeft / 30) * 100}
            className="h-2 bg-slate-100"
          />
        </div>

        {/* Info */}
        <div className="mt-6 flex items-center gap-2 text-xs text-slate-400 bg-slate-50 px-3 py-1 rounded-md">
          {isOnline ? (
            <Wifi className="w-3 h-3 text-green-500" />
          ) : (
            <WifiOff className="w-3 h-3 text-orange-500" />
          )}
          <span>
            {isOnline
              ? "Online način rada"
              : "Offline način rada (Kod je validan)"}
          </span>
        </div>
      </div>
    </div>
  );
}
