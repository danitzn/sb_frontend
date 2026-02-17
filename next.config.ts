import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://sky-blue-onrn.onrender.com/api/:path*',
      },
    ]
  },
};

export default nextConfig;
