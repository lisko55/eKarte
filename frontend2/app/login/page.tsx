"use client";

import { loginUser } from "@/actions/auth-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { GoogleLoginButton } from "@/components/google-login";

export default function LoginPage() {
  const router = useRouter();

  return (
    <div className="flex justify-center items-center min-h-[70vh] py-10">
      <Card className="w-[400px] shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Prijava</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 1. GOOGLE PRIJAVA */}
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

          {/* 3. KLASIČNA FORMA */}
          <form
            action={async (formData) => {
              const res = await loginUser(formData);

              if (res?.error) {
                toast.error(res.error);
              } else if (res?.success) {
                localStorage.setItem("userInfo", JSON.stringify(res.user));
                toast.success("Uspješna prijava!");
                window.location.href = "/";
              }
            }}
            className="flex flex-col gap-4"
          >
            <Input
              type="email"
              name="email"
              placeholder="Email adresa"
              required
            />
            <Input
              type="password"
              name="password"
              placeholder="Lozinka"
              required
            />

            <Button type="submit" className="w-full text-lg">
              Prijavi se
            </Button>
          </form>

          <div className="text-right text-sm">
            <Link
              href="/forgot-password" // Pazi: putanja je obično s crticom
              className="text-primary hover:underline"
            >
              Zaboravili ste lozinku?
            </Link>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            Nemaš račun?{" "}
            <Link
              href="/register"
              className="text-primary font-bold hover:underline"
            >
              Registriraj se
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
