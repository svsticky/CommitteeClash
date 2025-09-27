import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Environment variables to be used in the client-side code
  env: {
    NEXT_PUBLIC_OAUTH_PROVIDER_URL: process.env.NEXT_PUBLIC_OAUTH_PROVIDER_URL,
    NEXT_PUBLIC_OAUTH_PROVIDER_NAME:
      process.env.NEXT_PUBLIC_OAUTH_PROVIDER_NAME,
  },

  // Excludes pino and pino-pretty from the server bundle
  serverExternalPackages: ['pino', 'pino-pretty'],

  //Reduces the size of the output in production
  output: 'standalone',

  // Removes console.log() calls in production
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Disable ESLint during production builds
  eslint: {
    ignoreDuringBuilds: process.env.NODE_ENV === 'production', // Disable ESLint in production
  },

  // Enable backend images
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'backend',
        port: '8080',
        pathname: '/Task/images/**',
      },
    ],
  },

  experimental: {
    serverActions: {
      bodySizeLimit: '20mb',
    },
  },
};

export default nextConfig;
