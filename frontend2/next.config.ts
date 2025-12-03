/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "utfs.io", // UploadThing
      },
      {
        protocol: "https",
        hostname: "**", // <--- OVO DOZVOLJAVA SVE HTTPS DOMENE
      },
      {
        protocol: "http",
        hostname: "**", // <--- OVO DOZVOLJAVA SVE HTTP DOMENE
      },
    ],
  },
  // Ovo sprječava greške ako koristiš mongoose u server components
  experimental: {
    // OVO JE KLJUČNO ZA PDF GENERIRANJE
    serverComponentsExternalPackages: ["mongoose", "@react-pdf/renderer"],
  },
};

export default nextConfig;
