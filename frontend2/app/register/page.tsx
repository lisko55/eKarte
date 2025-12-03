"use client";

import { registerUser } from "@/actions/auth-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { toast } from "sonner";
import { GoogleLoginButton } from "@/components/google-login"; // <--- IMPORT

export default function RegisterPage() {
  return (
    <div className="flex justify-center items-center min-h-[80vh] py-10">
      <Card className="w-[400px] shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Registracija</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 1. GOOGLE LOGIN */}
          <GoogleLoginButton />

          {/* 2. RAZDJELNIK */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Ili putem emaila
              </span>
            </div>
          </div>

          {/* 3. STANDARDNA FORMA */}
          <form
            action={async (formData) => {
              const res = await registerUser(formData);
              if (res?.error) {
                toast.error(res.error);
              } else {
                toast.success(
                  res.message || "Registracija uspješna! Provjerite email."
                );
              }
            }}
            className="flex flex-col gap-4"
          >
            <div className="flex gap-2">
              <Input name="name" placeholder="Ime" required />
              <Input name="lastName" placeholder="Prezime" required />
            </div>

            <Input
              type="email"
              name="email"
              placeholder="Email adresa"
              required
            />
            <Input
              type="tel"
              name="phone"
              placeholder="Broj telefona"
              required
            />
            <Input
              type="password"
              name="password"
              placeholder="Lozinka"
              required
            />

            <Button type="submit" className="w-full text-lg">
              Kreiraj račun
            </Button>
          </form>

          <p className="text-center mt-4 text-sm text-muted-foreground">
            Već imaš račun?{" "}
            <Link
              href="/login"
              className="text-primary font-bold hover:underline"
            >
              Prijavi se
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
