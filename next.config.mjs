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
  // Ensure error pages are correctly generated
  generateEtags: false,
  // Serve from static HTML for public files
  poweredByHeader: false,
  // Disable compression for better compatibility
  compress: false,
};

export default nextConfig;