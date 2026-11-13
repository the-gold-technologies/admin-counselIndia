import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    // Only optimise images from our own asset host. A wildcard here turns
    // /_next/image (which is reachable without login) into an open proxy.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: `/${process.env.CLOUDINARY_CLOUD_NAME || "*"}/**`,
      },
    ],
    // Re-use optimised variants instead of regenerating them frequently
    minimumCacheTTL: 60 * 60 * 24,
    dangerouslyAllowSVG: false,
  },
};

export default nextConfig;
