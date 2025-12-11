import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "xjoxq4ytzibs6uny.public.blob.vercel-storage.com",
        // pathname: "/**",  // 必要なら付けてもOK（省略でも大丈夫）
      },
    ],
  },
};

export default nextConfig;
