import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Enable performance optimizations
  experimental: {
    optimizeCss: true,
  },
  // Enable image optimization
  images: {
    minimumCacheTTL: 60,
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },
};

export default nextConfig;