# Testing results

**Author:** Ryan Naidji · **Date:** 2026-11-04 · **Environment:** local Docker stack (MongoDB 7, API, web), Windows 11

## Summary

| Suite | Tool | Result |
|---|---|---|
| API unit and integration | Jest + Supertest + in-memory MongoDB | **33 / 33** (13 suites) |
| Workflows (candidate, employer, visitor, admin, access control) | `scripts/e2e-workflows.mjs` | **30 / 30** |
| Browser smoke, Chrome desktop | Playwright | **16 / 16** |
| Browser smoke, Chrome mobile (Pixel 7) | Playwright | **16 / 16** |
| Browser smoke, Microsoft Edge desktop | Playwright | **16 / 16** |
| Browser smoke, Firefox desktop | Playwright | **16 / 16** |
| Browser smoke, Safari engine (WebKit) desktop | Playwright | **16 / 16** |
| Browser smoke, Safari engine (WebKit) iPhone 14 | Playwright | **16 / 16** |
| Accessibility / SEO / best practices | Lighthouse 12 | **100 / 100 / 100** on 10 public pages |
| Responsive (375 px, 768 px) | puppeteer | No horizontal overflow on 9 pages |

## Workflows covered (`scripts/e2e-workflows.mjs`)

1. Employer: register → verify email (code from console driver) → log in → onboarding 2 and 3 → post a job.
2. Visitor: finds the job in public search.
3. Candidate: register → verify → log in → onboarding 2 and 3 → apply → duplicate rejected → sees the application.
4. Employer: lists applicants → shortlists.
5. Admin: log in → search → suspend (login refused) → reactivate → close job.
6. Access control: anonymous apply 401, candidate listing applicants 403, employer on admin API 403, regex search treated as text.

## Browser smoke tests (`e2e/tests/smoke.spec.ts`)

Ten public pages (status 200, page title, one h1, no horizontal scroll), security headers,
robots and sitemap, accessible login error, admin redirect, help assistant, visible keyboard focus.

## Defects found by this round (fixed)

| Found by | Defect | Fix |
|---|---|---|
| WebKit run | The login/sign-up side card floated forever (`animation: … infinite`), so the form was never "stable" for automation; it also breaks WCAG 2.2.2 (moving content > 5 s) | Animation plays once (4.5 s) |
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
- Logged-in dashboards are covered by the API workflow checks, not yet by browser tests.
- The Windows WebKit build is slow; the admin redirect check allows 15 s.
