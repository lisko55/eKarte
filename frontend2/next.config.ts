import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

// 1. Inicijalizacija PWA (s TypeScript tipovima)
const withPWA = withPWAInit({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development", // Isključi u dev modu
  workboxOptions: {
    disableDevLogs: true,
  },
});

// 2. Tvoja Next.js konfiguracija
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "utfs.io" },
      { protocol: "https", hostname: "**" }, // Dozvoljava sve slike
    ],
  },
  experimental: {
    // Ovo nam treba za PDF generiranje i Mongoose
    serverComponentsExternalPackages: ["mongoose", "@react-pdf/renderer"],
  },
};

// 3. Exportamo konfiguraciju omotanu u PWA
export default withPWA(nextConfig);
