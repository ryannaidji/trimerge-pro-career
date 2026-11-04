// Public base URL of the website (no trailing slash), used for sitemap, robots and metadata.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || "http://localhost:3000"
).replace(/\/$/, "");
