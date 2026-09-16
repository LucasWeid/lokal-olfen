import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "192.168.178.23",
    "192.168.178.23:3000",
  ],
};

export default nextConfig;