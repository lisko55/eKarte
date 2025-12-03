"use client";

import { useState, useEffect } from "react";
import { resetPasswordAction } from "@/actions/auth-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Lock, CheckCircle } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";

export default function ResetPasswordPage() {
  const params = useParams(); // Next.js Client Hook za parametre
  const token = params.token as string;
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error("Lozinke se ne podudaraju!");
      return;
    }

    if (password.length < 6) {
      toast.error("Lozinka mora imati barem 6 znakova.");
      return;
    }

    setLoading(true);

    try {
      const res = await resetPasswordAction(token, password);
      if (res.success) {
        setSuccess(true);
        toast.success("Lozinka uspješno promijenjena!");
        // Redirect nakon 3 sekunde (opcionalno, ili pusti usera da klikne)
        setTimeout(() => router.push("/login"), 3000);
      } else {
        toast.error(res.error || "Token je nevažeći ili je istekao.");
      }
    } catch (error) {
      toast.error("Greška na serveru.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <Card className="w-full max-w-md text-center shadow-lg border-green-200 bg-green-50">
          <CardContent className="py-10 flex flex-col items-center gap-4">
            <CheckCircle className="w-16 h-16 text-green-600" />
            <h2 className="text-2xl font-bold text-green-800">Uspjeh!</h2>
            <p className="text-green-700">Vaša lozinka je promijenjena.</p>
            <Button asChild className="mt-4 w-full bg-green-600 hover:bg-green-700">
              <Link href="/login">Idi na Prijavu</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Nova Lozinka</CardTitle>
          <CardDescription>
            Unesite novu lozinku za svoj račun.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Nova lozinka</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="******"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Potvrdi lozinku</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="******"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-9"
                  required
                />
              </div>
            </div>
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Spremanje...</>
              ) : (
                "Promijeni lozinku"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}