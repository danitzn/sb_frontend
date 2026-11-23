import type { NextConfig } from 'next';
import { getBackendUrl } from './lib/backend';

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/proxy/:path*',
        destination: `${getBackendUrl()}/api/:path*/`,
      },
    ];
  },
};

export default nextConfig;
