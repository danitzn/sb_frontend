import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const API_BASE_URL = process.env.API_BASE_URL ?? 'http://localhost:8000';
    return [
      {
        source: '/api/proxy/:path*',
        destination: `${API_BASE_URL}/api/:path*/`, 
      },
    ];
  },
};

export default nextConfig;