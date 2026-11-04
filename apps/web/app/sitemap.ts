import type { MetadataRoute } from "next";
import { SITE_URL } from "./util/siteUrl";

// Public, indexable pages only. Route groups like (main) are not part of the URL.
// Auth flows, dashboards and account pages are intentionally excluded (#12).
const PUBLIC_PAGES: { path: string; priority: number }[] = [
  { path: "", priority: 1 },
  { path: "browse-jobs", priority: 0.9 },
  { path: "employers", priority: 0.8 },
  { path: "about", priority: 0.7 },
  { path: "join-now", priority: 0.6 },
  { path: "login", priority: 0.4 },
  { path: "eeo-statement", priority: 0.3 },
  { path: "accessibility-statement", priority: 0.3 },
  { path: "privacy-policy", priority: 0.3 },
  { path: "terms-of-use", priority: 0.3 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return PUBLIC_PAGES.map(({ path, priority }) => ({
    url: path ? `${SITE_URL}/${path}` : SITE_URL,
    lastModified,
    priority,
  }));
}
