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
| D20 | Medium | API · jobs | Job departments limited to ENGINEERING / MARKETING / HR / SALES / DESIGN / OPERATIONS, which does not match the sectors on the homepage (government, healthcare, finance…) | Fixed — 12 sectors from the homepage; old values still accepted | #62 |
| D21 | Medium | Web · auth | Access and refresh tokens stored in `localStorage` (exposed to XSS) | Open — architectural change, needs approval | #69 |
| D22 | Low | Web · lint | ESLint reports pre-existing errors (CI step is non-blocking) | Fixed — 0 errors, lint blocking in CI | #63 |
| D23 | Medium | API · uploads | Local upload URLs are unguessable but not authenticated | Fixed — authenticated download route | #59 |
| D24 | High | Web · candidate | "My applications" page showed hard-coded sample applications and never called the API | Fixed (real data, real statuses) | #36 |
| D25 | High | Web · employer | On phones the "Post a Job" wizard was cut off and its Next button was off-screen (dashboard wider than the screen; flex scroll area without `min-height: 0`) | Fixed | #31 |
| D26 | Medium | Web · a11y | 57 text elements in light grey `#94a3b8` (2.56:1 contrast) on logged-in pages | Fixed (`#64748b`, 4.76:1) | #24 |
| D27 | Low | Web · jobs | Job location called an external API (countriesnow.space) from the browser | Fixed (local list, free-text city) | #43 |
| D28 | Critical | Web · employer | Employers could not change an application status (no UI for `PATCH /applications/:id/status`) | Fixed | #47 |
| D29 | High | Web · candidate | No candidate menu; "My applications" only reachable by URL; no profile page after onboarding | Fixed | #49, #50 |
| D30 | High | Web · sessions | 15-minute access token never refreshed: users signed out mid-task | Fixed (SessionKeeper + authFetch) | #55 |
| D31 | Medium | API · auth | Logout did not revoke the refresh token | Fixed | #56 |
| D32 | Medium | Web · settings | Change-password page was a mockup; changing the password also signed the current device out | Fixed | #57 |
| D33 | Medium | API · privacy | Deleting an account left uploaded files on disk | Fixed | #58 |
| D34 | Medium | Web · a11y | Resume picker in the application form was a clickable div (not keyboard accessible); editor toolbar ignored Enter/Space | Fixed | #63 |
| D35 | Low | Web · UX | Visitors could fill the whole application form before being told to log in | Fixed | #47 |
| D36 | Medium | Web · admin | Admins were treated as candidates: candidate menu with no link to `/admin`, candidate pages reachable, "Apply Now" and "Delete account" offered | Fixed (admin menu, redirect to `/admin`, candidate actions hidden) | #72 |
| D37 | High | Web · access | Candidates and admins could open the employer dashboard; its data calls failed with no message | Fixed (`RequireRole`) | #73 |
| D38 | High | Web · navigation | Empty navbar on `/browse-jobs` for employers and visitors | Fixed | #74 |
| D39 | Medium | Web · access | Raw "Forbidden" for employers on candidate pages; "session expired" shown to visitors; Settings and onboarding open to the wrong users | Fixed (`RequireRole`) | #75–#78 |
| D40 | Low | Web · access | Talent search form shown to candidates and visitors; login and sign-up shown to signed-in users | Fixed (`RequireRole`, `GuestOnly`) | #79, #80 |
| D41 | Low | Web · help | Help assistant always started in Candidate mode | Fixed | #81 |
| D42 | Low | Web · session | Unused `updateProfile` would have erased the stored account type | Fixed (removed) | #82 |

