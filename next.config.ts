import type { NextConfig } from "next";

const nextConfig = {
  experimental: {
    serverActions: {
      // Augmente la limite à 5 Mo (vous pouvez mettre '10mb', '50mb', etc.)
      bodySizeLimit: "5mb",
    },
  },
};

module.exports = nextConfig;

export default nextConfig;
