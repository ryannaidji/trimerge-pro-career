# Testing results

**Author:** Ryan Naidji · **Date:** 2026-11-04 (updated) · **Environment:** local Docker stack (MongoDB 7, API, web), Windows 11

## Summary

| Suite | Tool | Result |
|---|---|---|
| API unit and integration | Jest + Supertest + in-memory MongoDB | **33 / 33** (13 suites) |
| Workflows (all five user profiles + access control) | `scripts/e2e-workflows.mjs` | **52 / 52** |
| Browser: public + logged-in pages, Chrome desktop | Playwright + axe | **28 / 28** |
| Browser: public + logged-in pages, Chrome mobile (Pixel 7) | Playwright + axe | **28 / 28** |
| Browser smoke, Microsoft Edge desktop | Playwright | **16 / 16** |
| Browser smoke, Firefox desktop | Playwright | **16 / 16** |
| Browser smoke, Safari engine (WebKit) desktop | Playwright | **16 / 16** |
| Browser smoke, Safari engine (WebKit) iPhone 14 | Playwright | **16 / 16** |
| Accessibility / SEO / best practices | Lighthouse 12 | **100 / 100 / 100** on 10 public pages |
| Responsive (375 px, 768 px) | puppeteer | No horizontal overflow on 9 pages |

## Workflows covered (`scripts/e2e-workflows.mjs`)

The five profiles Gerri listed: **new job seeker, returning candidate, new employer, existing
employer managing postings, platform administrator.**

1. Employer: register → verify email (code from console driver) → log in → onboarding 2 and 3 → post a job.
2. Visitor: finds the job in public search.
3. Candidate: register → verify → log in → onboarding 2 and 3 → apply → duplicate rejected → sees the application.
4. Employer: lists applicants → shortlists.
5. Admin: log in → search → suspend (login refused) → reactivate → close job.
6. Returning candidate: update profile, upload resume (served as download with nosniff), fake PDF rejected, bookmark add/list/remove, password reset by emailed code (old password refused), change password.
7. Existing employer: edit job, candidate cannot edit it (403), create and delete a job, upload company logo, find talent by skill (no email or resume text exposed), candidates cannot search (403).
8. Access control: anonymous apply 401, candidate listing applicants 403, employer on admin API 403, regex search treated as text.

## Browser smoke tests (`e2e/tests/smoke.spec.ts`)

Ten public pages (status 200, page title, one h1, no horizontal scroll), security headers,
robots and sitemap, accessible login error, admin redirect, help assistant, visible keyboard focus.

## Logged-in pages in the browser (`e2e/tests/logged-in.spec.ts`)

Each page is opened as the right role and checked with **axe** (WCAG 2.1 A/AA, zero serious or
critical issues allowed) and for horizontal overflow: candidate applications, browse jobs,
candidate onboarding 1-2, employer dashboard, employer onboarding 1-2, talent search, admin
dashboard, job description assistant, local job location fields.

## Defects found by this round (fixed)

| Found by | Defect | Fix |
|---|---|---|
| WebKit run | The login/sign-up side card floated forever (`animation: … infinite`), so the form was never "stable" for automation; it also breaks WCAG 2.2.2 (moving content > 5 s) | Animation plays once (4.5 s) |
| Logged-in run | "My applications" showed hard-coded sample data, not the candidate's real applications | Connected to the API |
| Mobile run | "Post a Job" wizard unusable on phones (Next button off-screen) | Responsive layout, portal, `min-height: 0` |
| axe run | 57 low-contrast text elements on logged-in pages | Darker grey (4.76:1) |
| Chrome run | Login inputs had no `name` / `autocomplete` (password managers, accessibility) | Added |
| Workflow run | Applications saved without `candidateId`; invalid ids gave 500 | Fixed (see `issues.md`) |

## How to run

```sh
docker compose up -d --build
node scripts/e2e-workflows.mjs
cd e2e && npm ci && npx playwright test                       # Chrome desktop + mobile
npx playwright install firefox webkit && ALL_BROWSERS=1 npx playwright test   # + Firefox, WebKit
PW_CHANNEL=msedge npx playwright test --project=desktop          # Edge
```

CI (`.github/workflows/ci.yml`) runs the API tests, the workflow checks and the Chromium browser
tests against a fresh Docker stack on every push to `dev`, `main`, `feat/**` and `fix/**`.

## Limits

- WebKit on Windows approximates Safari; before launch, check on a real iPhone and Mac.
- The Windows WebKit build is slow; the admin redirect check allows 15 s.
