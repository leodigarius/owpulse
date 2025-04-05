/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Images config for Vercel
  images: {
    domains: ['vercel.com'],
    unoptimized: true,
  },
  // Use export mode for full static generation
  output: 'export',
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
  // Disable powered by header
  poweredByHeader: false,
  // Disable compression for better compatibility
  compress: false,
};

export default nextConfig;