import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: "http://157.85.103.33:8080/api/v1/:path*",
      },
    ];
  },
};

export default nextConfig;
