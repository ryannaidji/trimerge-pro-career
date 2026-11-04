import type { MetadataRoute } from "next";
import { SITE_URL } from "./util/siteUrl";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Private areas and API adapters should not be crawled (#12)
      disallow: [
        "/admin",
        "/api/",
        "/.netlify/",
        "/employer-dashboard",
        "/candidate-overview",
        "/talent-search",
        "/applications",
        "/personal-information",
        "/recruiter-information",
        "/change-password",
        "/reset-password",
        "/mfa",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
