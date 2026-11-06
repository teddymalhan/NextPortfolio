import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);

const analyticsHost = process.env.NEXT_PUBLIC_POSTHOG_HOST;
const analyticsOrigins = new Set();
if (analyticsHost && !analyticsHost.startsWith('/')) {
  const host = new URL(analyticsHost);
  analyticsOrigins.add(host.origin);
  // The SDK routes cloud ingestion and lazy assets to region-specific hosts.
  const cloudRegion = host.hostname.match(/^(app|us|us-assets|eu|eu-assets)(?:\.i)?\.posthog\.com$/);
  if (cloudRegion && host.protocol === 'https:') {
    const region = cloudRegion[1].startsWith('eu') ? 'eu' : 'us';
    analyticsOrigins.add(`https://${region}.i.posthog.com`);
    analyticsOrigins.add(`https://${region}-assets.i.posthog.com`);
  }
}
const analyticsSources = [...analyticsOrigins].join(' ');

const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      `script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.clerk.com https://*.clerk.accounts.dev https://clerk.malhan.ca https://vitals.vercel-insights.com https://vercel.live https://va.vercel-scripts.com ${analyticsSources} blob:`,
      "worker-src 'self' blob:",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: https: blob:",
      `connect-src 'self' https://*.clerk.com https://*.clerk.accounts.dev https://clerk.malhan.ca https://vitals.vercel-insights.com https://vercel.live https://*.vercel-storage.com https://clerk-telemetry.com ${analyticsSources}`,
      "frame-src 'self' https://*.clerk.com https://*.clerk.accounts.dev https://clerk.malhan.ca https://vercel.live https://*.vercel-storage.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests",
    ].join('; '),
  },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  cacheComponents: true,
  cacheLife: {
    'resume-data': {
      stale: 60,
      revalidate: 300,
      expire: 3600,
    },
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
      {
        source: '/:path*\\.(jpg|jpeg|png|webp|svg|ico)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=604800',
          },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: 'praxis.encommun.io',
      },
      {
        protocol: 'https',
        hostname: 'encrypted-tbn0.gstatic.com',
      },
      {
        protocol: 'https',
        hostname: 'media.licdn.com',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Extended cache for static images (24 hours)
    minimumCacheTTL: 86400,
  },
  // Next requires an explicit Turbopack choice when a webpack override also exists.
  turbopack: {},
  // Keep webpack config for explicit webpack builds
  webpack: (config) => {
    // Fix webpack cache warning for large strings
    config.cache = {
      type: 'filesystem',
      buildDependencies: {
        config: [__filename],
      },
    };
    return config;
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
    optimizeCss: true,
    optimizeServerReact: true,
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
}

export default nextConfig
