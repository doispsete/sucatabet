import type { NextConfig } from 'next';

const isProd = process.env.NODE_ENV === 'production';

const nextConfig: NextConfig = {
  output: 'standalone',
  env: {
    TZ: 'America/Sao_Paulo',
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.API_URL || 'http://localhost:3006/api'}/:path*`,
      },
    ];
  },
  ...(!isProd && {
    turbopack: {
      root: __dirname,
    },
  }),
};

export default nextConfig;
