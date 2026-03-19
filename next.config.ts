import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      exclude: /node_modules/,
      use: ['@svgr/webpack'],
    });
    config.module.rules.push({
      test: /\.svg$/,
      include: /node_modules/,
      type: 'asset/resource',
    });
    return config;
  },
};

export default nextConfig;
