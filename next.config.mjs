/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // Handle canvas module for jspdf
    config.resolve.fallback = {
      ...config.resolve.fallback,
      canvas: false,
    };
    return config;
  },
  images: {
    unoptimized: true,
  },
  // Allow importing from src directory
  transpilePackages: [],
};

export default nextConfig;
