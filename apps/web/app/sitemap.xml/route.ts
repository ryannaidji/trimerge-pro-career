export async function GET() {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || "http://localhost:3000";

  // Full list of routes derived from the app/ directory (route-group folders in parentheses are omitted)
  const pages = [
    "", // /

    // Authentication top-level
    "join-now",
    "link-sent",
    "login",
    "session-expired",
    "signup",
    "email-verified",
    
    //Mfa
    "mfa",
    "mfa/set-up",

    // Candidate auth flow
    "personal-information",
    "personal-information/step-one",
    "personal-information/step-two",
    "personal-information/registration-complete",


    // Email pages
    "email-expired",
    "email-sent",

    // Password flow
    "change-password",
    "forgot-password",
    "password-success",
    "reset-password",

    // Recruiter flow
    "recruiter-information",
    "recruiter-information/step-one",
    "recruiter-information/step-two",
    "recruiter-information/registration-complete",
    // Employee-facing
    "employee/applications",
    "employee/browse-jobs",

    // Employer-facing
    "employer/employer-dashboard",

    // Main
    "main/about",

    // Misc
    "unauthorized",
  ];

  const lastmod = new Date().toISOString();

  const urls = pages
    .map((p) => {
      const loc = `${siteUrl.replace(/\/$/, "")}/${p}`.replace(/\/$/, "");
      return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}

export const runtime = "edge";
