import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: true,
  async rewrites() {
    // 1. Extraemos la URL de una variable de entorno
    // 2. Definimos un fallback por si se nos olvida configurar el .env
    const API_BASE_URL = process.env._API_URL || 'https://workflow-circular-exams-brake.trycloudflare.com';

    return [
      {
        source: '/api/:path*',
        // 3. Aseguramos que la URL sea absoluta y dinámica
        destination: `${API_BASE_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;