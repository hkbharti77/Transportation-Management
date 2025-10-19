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
  // Add proxy configuration for API requests
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://127.0.0.1:8000/api/:path*',
      },
    ];
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