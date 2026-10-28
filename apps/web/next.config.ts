import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
    allowedDevOrigins: ['10.0.0.29'],
    // Self-contained server build for the Docker image
    output: process.env.NEXT_OUTPUT === "standalone" ? "standalone" : undefined,
    // Outside Netlify, serve the Netlify Functions through app/api/netlify-functions
    async rewrites() {
      if (process.env.NETLIFY === "true") return [];
      return [{ source: "/.netlify/functions/:name", destination: "/api/netlify-functions/:name" }];
    },
};

export default nextConfig;
