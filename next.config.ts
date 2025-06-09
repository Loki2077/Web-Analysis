import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    
  },
  // Vercel无服务器部署配置
  images: {
    unoptimized: true
  }
};

export default nextConfig;
