import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optimize for Vercel deployment
  experimental: {
    serverComponentsExternalPackages: ["@distube/ytdl-core"],
  },
  // Increase memory limit for serverless functions
  serverRuntimeConfig: {
    maxDuration: 30,
  },
  // Handle large payloads
  api: {
    bodyParser: {
      sizeLimit: "10mb",
    },
    responseLimit: false,
  },
  // Optimize images and static assets
  images: {
    domains: ["i.ytimg.com", "img.youtube.com"],
    unoptimized: true,
  },
  // Handle CORS for API routes
  async headers() {
    return [
      {
        source: "/api/(.*)",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "*",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
