/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,

  // ── Compression: reduces data transferred per response ──────────────────
  compress: true,

  // ── Image optimization: serve WebP/AVIF, cache at edge for 1 year ───────
  images: {
    domains: ['i.pravatar.cc'],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 31536000, // 1 year in seconds
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  // ── API proxy: forward to backend without Vercel re-serving response data ─
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.NEXT_PUBLIC_API_URL + '/:path*',
      },
    ];
  },

  // ── Cache-Control headers: Vercel CDN caches these at the edge ───────────
  // This means repeat visitors never hit your origin — zero egress for them.
  async headers() {
    return [
      // Static JS/CSS chunks — immutable (Next.js uses content hashes in filenames)
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Next.js image optimization endpoint
      {
        source: '/_next/image/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Public static files (icons, fonts, images in /public)
      {
        source: '/favicon.ico',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=86400',
          },
        ],
      },
      {
        source: '/:path*.png',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/:path*.svg',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/:path*.woff2',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // HTML pages — short cache so data stays fresh, but Vercel CDN still helps
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
          // Vary on Accept-Encoding so gzip/brotli responses are cached separately
          {
            key: 'Vary',
            value: 'Accept-Encoding',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
