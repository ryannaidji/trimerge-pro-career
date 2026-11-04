# Defect log

**Author:** Ryan Naidji · **Started:** 2026-11-03

Defects found while testing locally (Docker stack, `scripts/e2e-workflows.mjs`, API test
suite, code review). Severity: **Critical** (security or data loss), **High** (core workflow
broken), **Medium** (degraded feature or hardening gap), **Low** (cosmetic / content).

| # | Severity | Area | Defect | Status | Fixed in |
|---|---|---|---|---|---|
| D1 | Critical | API · applications | `POST /api/v1/applications` had authentication and role checks commented out; anyone could apply anonymously | Fixed | #19 |
| D2 | High | API · applications | `candidateId` was commented out when saving an application, so candidates never saw their applications and employers could not tell who applied | Fixed | #19 |
| D3 | High | API · candidates | `GET /candidates/:id` exposed personal data and resume links to any signed-in user | Fixed | #19 |
| D4 | High | Admin | Suspending a user did not stop token refresh; a suspended user stayed signed in for up to 7 days | Fixed | #9 |
| D5 | High | Local dev | API refused to start without Mailgun and Cloudinary credentials | Fixed | #2 |
| D6 | High | Web | Web app fell back to the production API when `NEXT_PUBLIC_API_URL` was missing | Fixed | #16 |
| D7 | Medium | API · logs | MongoDB URI, tokens, API responses and OTP codes written to logs | Fixed | #17 |
| D8 | Medium | API · errors | Stack traces returned in error responses; malformed JSON returned 500 | Fixed | #45 |
| D9 | Medium | API · search | User input used as raw `$regex` (ReDoS) in admin, jobs and public job search | Fixed | #20 |
| D10 | Medium | API · uploads | File type trusted from extension and browser MIME only | Fixed | #21 |
| D11 | Medium | API | No rate limiting on login, OTP and password reset | Fixed | #20 |
| D12 | Medium | API | Invalid ObjectId in URL returned 500 instead of 400 | Fixed | #19 |
| D13 | Medium | Web | No security headers (CSP, HSTS, frame protection) | Fixed | #18 |
| D14 | Medium | Web · SEO | Sitemap listed private pages with wrong URLs (`/employee/...`, `/main/about`); no `robots.txt` | Fixed | #12 |
| D15 | Low | Web · SEO | No page titles or meta descriptions | Fixed | #13 |
| D16 | Low | Web · content | About page had developer jargon and unverified benefits (equity, unlimited PTO, $3,000 budget) | Fixed | #14 |
| D17 | Low | Web · content | Brand written both "TriMergePro" and "TriMergePRO" | Fixed | #15 |
| D18 | Low | Web · footer | Legal links were relative (`privacy-policy`) and broke on nested pages | Fixed | #10 |
| D19 | Low | Web · login | Admin accounts had no destination after login | Fixed | #9 |
| D20 | Medium | API · jobs | Job departments limited to ENGINEERING / MARKETING / HR / SALES / DESIGN / OPERATIONS, which does not match the sectors on the homepage (government, healthcare, finance…) | Open — needs a business decision on the list | – |
| D21 | Medium | Web · auth | Access and refresh tokens stored in `localStorage` (exposed to XSS) | Open — architectural change, needs approval | – |
| D22 | Low | Web · lint | ESLint reports pre-existing errors (CI step is non-blocking) | Open | – |
| D23 | Medium | API · uploads | Local upload URLs are unguessable but not authenticated | Open — use signed URLs before launch | #21 |
