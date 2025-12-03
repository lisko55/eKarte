"use client";

import { useState } from "react";
import { forgotPasswordAction } from "@/actions/auth-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, ArrowLeft, Mail } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await forgotPasswordAction(email);
      if (res.success) {
        toast.success("Email poslan!", {
          description: "Provjerite svoj inbox za link za resetiranje.",
        });
        setEmail(""); // Očisti polje
      } else {
        toast.error(res.error || "Došlo je do greške.");
      }
    } catch (error) {
      toast.error("Greška na serveru.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Zaboravljena lozinka?</CardTitle>
          <CardDescription>
            Unesite svoju email adresu i poslat ćemo vam link za resetiranje.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="ime@primjer.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9"
                  required
                />
              </div>
            </div>
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Slanje...</>
              ) : (
                "Pošalji link za resetiranje"
              )}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <Link 
              href="/login" 
              className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Natrag na prijavu
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}