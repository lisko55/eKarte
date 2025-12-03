"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function LoginSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const userStr = searchParams.get("user");
    if (userStr) {
      try {
        const user = JSON.parse(decodeURIComponent(userStr));
        localStorage.setItem("userInfo", JSON.stringify(user));
        // Prisilni reload da Header uhvati promjenu ili router.push
        window.location.href = "/"; 
      } catch (e) {
        router.push("/login");
      }
    } else {
      router.push("/login");
    }
  }, [searchParams, router]);

  return (
    <div className="flex h-screen items-center justify-center">
      <Loader2 className="w-10 h-10 animate-spin text-primary" />
      <span className="ml-2">Dovršavanje prijave...</span>
    </div>
  );
}