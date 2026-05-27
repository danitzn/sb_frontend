import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_API_CHAT_PATH: process.env.API_CHAT_PATH || 'cloud',
  },
  async rewrites() {
    const API_BASE_URL = process.env.API_BASE_URL ?? 'https://lip-politics-drop-luck.trycloudflare.com';
    return [
      {
        source: '/api/proxy/:path*',
        destination: `${API_BASE_URL}/api/:path*/`, 
      },
    ];
  },
};

export default nextConfig;