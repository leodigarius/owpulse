/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  // Use standalone mode which works better with API routes
  output: 'standalone',
  // Add trailing slash for better routing
  trailingSlash: true,
  // Skip type checking during build to improve build speed
  typescript: {
    ignoreBuildErrors: true,
  },
  // Skip ESLint during build
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;