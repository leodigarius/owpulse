/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactStrictMode: true,
  // Config for production builds
  compiler: {
    styledComponents: true,
  },
  images: {
    unoptimized: true,
  },
  // Enable for better Vercel compatibility
  output: 'standalone',
  // Add trailing slash for better compatibility
  trailingSlash: true,
};

export default nextConfig;