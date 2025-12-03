/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "utfs.io" },
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
  // --- OVO JE NOVO MJESTO (Izvan experimental) ---
  serverExternalPackages: ["mongoose", "@react-pdf/renderer"],
  // -----------------------------------------------
};

export default nextConfig;
