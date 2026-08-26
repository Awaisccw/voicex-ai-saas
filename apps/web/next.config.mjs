/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@saas/ui", "@saas/types", "@saas/core", "@saas/db"],
  experimental: {
    serverComponentsExternalPackages: ["bullmq", "ioredis"],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
