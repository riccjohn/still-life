import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "collectionapi.metmuseum.org",
      },
      {
        protocol: "https",
        hostname: "images.metmuseum.org",
      },
      {
        protocol: "https",
        hostname: "www.artic.edu",
      },
      {
        protocol: "https",
        hostname: "openaccess-cdn.clevelandart.org",
      },
    ],
  },
};

export default nextConfig;
