import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone',
  experimental: {
    // Any other experimental options can go here
  },
  serverExternalPackages: ['puppeteer-core'],
};

export default nextConfig;
