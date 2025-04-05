/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Images config for Vercel
  images: {
    domains: ['vercel.com'],
    unoptimized: true,
  },
  // Run in serverless mode (better compatibility with Vercel)
  output: 'serverless',
  // Trailing slashes handled by Vercel config
  trailingSlash: true,
  // Skip type checking during build
  typescript: {
    ignoreBuildErrors: true,
  },
  // Skip ESLint during build
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Other performance options
  swcMinify: true,
  // Serve from static HTML for public files
  poweredByHeader: false,
  // Disable compression for better compatibility
  compress: false,
};

export default nextConfig;