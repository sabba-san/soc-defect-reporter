import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [], // We keep this empty for now
    unoptimized: true, // This fixes many local image issues
  },
};

export default nextConfig;