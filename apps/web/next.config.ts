import type { NextConfig } from "next";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const isDev = process.env.NODE_ENV !== "production";

// Content Security Policy (#18). 'unsafe-inline' is required by Next.js inline
// bootstrap scripts and styles without a nonce setup; 'unsafe-eval' only in dev (HMR).
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: ${apiUrl} https://res.cloudinary.com`,
  "font-src 'self' data:",
  `connect-src 'self' ${apiUrl}${isDev ? " ws: wss:" : ""}`,
  `frame-src 'self' ${apiUrl} https://res.cloudinary.com`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];

const nextConfig: NextConfig = {
  allowedDevOrigins: ["10.0.0.29"],
  poweredByHeader: false,
  // Self-contained server build for the Docker image
  output: process.env.NEXT_OUTPUT === "standalone" ? "standalone" : undefined,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  // Outside Netlify, serve the Netlify Functions through app/api/netlify-functions
  async rewrites() {
    if (process.env.NETLIFY === "true") return [];
    return [{ source: "/.netlify/functions/:name", destination: "/api/netlify-functions/:name" }];
  },
};

export default nextConfig;
