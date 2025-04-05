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
  // Remove standalone output to fix file copying issues
  // output: 'standalone',
};

export default nextConfig;