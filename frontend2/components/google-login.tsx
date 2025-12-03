"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";

export function GoogleLoginButton() {
  const handleGoogleLogin = () => {
    // Preusmjeri na Google OAuth endpoint
    const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";
    const options = {
      redirect_uri: process.env.NEXT_PUBLIC_APP_URL + "/api/auth/google/callback",
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!, // Dodaj NEXT_PUBLIC_ prefiks u .env za Client ID
      access_type: "offline",
      response_type: "code",
      prompt: "consent",
      scope: [
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/userinfo.email",
      ].join(" "),
    };

    const qs = new URLSearchParams(options);
    window.location.href = `${rootUrl}?${qs.toString()}`;
  };

  return (
    <Button 
      type="button" 
      variant="outline" 
      className="w-full flex gap-2" 
      onClick={handleGoogleLogin}
    >
      <Image src="/google.svg" width={20} height={20} alt="Google" /> {/* Skini google ikonu u public */}
      Prijava putem Googlea
    </Button>
  );
}