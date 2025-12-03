"use client";

import { verifyEmailAction } from "@/actions/auth-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");
  // Koristimo ref da spriječimo dvostruko pozivanje u React.StrictMode (development)
  const processed = useRef(false); 

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    if (!token) {
      setStatus("error");
      setMessage("Token nije pronađen.");
      return;
    }

    const verify = async () => {
      try {
        const result = await verifyEmailAction(token);
        if (result.success) {
          setStatus("success");
        } else {
          setStatus("error");
          setMessage(result.error || "Verifikacija nije uspjela.");
        }
      } catch (error) {
        setStatus("error");
        setMessage("Došlo je do greške.");
      }
    };

    verify();
  }, [token]);

  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <Card className="w-full max-w-md text-center shadow-lg">
        <CardHeader>
          <CardTitle>Verifikacija Emaila</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4 py-6">
          
          {status === "loading" && (
            <>
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
              <p className="text-muted-foreground">Provjeravamo vaš token...</p>
            </>
          )}

          {status === "success" && (
            <>
              <CheckCircle className="w-12 h-12 text-green-600" />
              <h2 className="text-xl font-semibold text-green-700">Uspješno verificirano!</h2>
              <p className="text-sm text-muted-foreground">Vaš račun je sada aktivan.</p>
              <Button asChild className="mt-4 w-full">
                <Link href="/login">Prijavi se</Link>
              </Button>
            </>
          )}

          {status === "error" && (
            <>
              <XCircle className="w-12 h-12 text-red-600" />
              <h2 className="text-xl font-semibold text-red-700">Greška</h2>
              <p className="text-sm text-muted-foreground">{message}</p>
              <Button asChild variant="outline" className="mt-4 w-full">
                <Link href="/login">Natrag na prijavu</Link>
              </Button>
            </>
          )}

        </CardContent>
      </Card>
    </div>
  );
}