/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactStrictMode: true,
  // Disable static optimization and force server-side rendering
  compiler: {
    styledComponents: true,
  },
  images: {
    unoptimized: true,
  },
  output: 'standalone',
};

export default nextConfig;