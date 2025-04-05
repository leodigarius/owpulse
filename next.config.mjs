/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Images config for Vercel
  images: {
    domains: ['vercel.com'],
    unoptimized: true,
  },
  // Use standalone mode to support API routes
  output: 'standalone',
  // Use trailing slashes for consistent URLs
  trailingSlash: true,
  // Skip type checking during build
  typescript: {
    ignoreBuildErrors: true,
  },
  // Skip ESLint during build
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Disable compression for better compatibility
  compress: false,
  // Generate static pages
  distDir: 'out',
  // Ensure error pages are correctly generated
  generateEtags: false,
  // Serve from static HTML for public files
  poweredByHeader: false,
  // Serve the fallback HTML for SPA-like behavior
  async rewrites() {
    return [
      {
        source: '/:path*',
        destination: '/:path*',
      },
      {
        source: '/',
        destination: '/index',
      },
    ];
  },
  // Ensure all paths fallback to index when not found
  async redirects() {
    return [
      {
        source: '/404',
        destination: '/',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;