/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',  // Change to export mode which is more compatible
  distDir: 'dist',   // Explicitly set the output directory
  images: {
    unoptimized: true,
  },
  // Ensure trailing slashes for better routing
  trailingSlash: true,
};

export default nextConfig;