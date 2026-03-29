import type { NextConfig } from 'next';

const isProd = process.env.NODE_ENV === 'production';

const nextConfig: NextConfig = {
  output: 'standalone',
  ...(!isProd && {
    turbopack: {
      root: __dirname,
    },
  }),
};

export default nextConfig;
