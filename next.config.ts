import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    
  },
  // 配置输出目录为dist以适配Vercel部署
  distDir: 'dist'
};

export default nextConfig;
