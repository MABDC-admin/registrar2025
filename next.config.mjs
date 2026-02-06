import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    turbo: {
      resolveAlias: {
        "@/*": [path.resolve(__dirname, "src") + "/*"],
      },
    },
  },
  webpack: (config) => {
    // Ensure @ alias resolves to src directory
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": path.resolve(__dirname, "src"),
    };
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
  transpilePackages: [],
};

export default nextConfig;
