import type { NextConfig } from "next";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8080";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },

  /**
   * Proxy transparent : toutes les requêtes /api/* sont redirigées vers
   * le backend Spring Boot (port 8080 par défaut).
   * Le frontend fait fetch('/api/properties') → backend :8080/api/properties.
   * Aucun CORS à configurer côté front.
   */
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${BACKEND_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;

