# MVP Launch Plan

**Author:** Ryan Naidji
**Date:** 2026-10-28
**Deadline:** 2026-10-30 (final delivery to TriMerge Consulting Group)

Plan to take TriMergePRO Careers from its current state to a launch-ready MVP. Based on the assignment brief, the preliminary assessment of 2026-10-23, and a review of the source code.

## Ground Rules

- Build on existing work; no rewrite, no major architecture change.
- No paid services, subscriptions or production deploys without approval.
- All work happens in the fork, on `feat/*` / `fix/*` branches from `dev`.
- Every change is documented in `docs/` and `CHANGELOG.md`.

## Current State (from code review)

| Area | Status |
|---|---|
| Stack | Next.js frontend (Netlify), Express + MongoDB API (Render), Cloudinary for resumes, Mailgun for email, OpenAI for AI matching |
| Candidate flows | Pages exist: sign-up, onboarding, profile, browse jobs, applications |
| Employer flows | Pages exist: onboarding, job creation wizard, dashboard, applicants |
| Admin | **Backend API exists** (`apps/api/src/modules/admin`), **no frontend UI** |
| Legal pages | Privacy, Terms, Accessibility exist; **EEO statement missing** |
| SEO | Sitemap falls back to `localhost:3000` (`NEXT_PUBLIC_SITE_URL` not set); no `robots.txt`; missing page titles |
| Security | HTTPS/HSTS OK; missing CSP, frame protection, Referrer-Policy |
| Tests | Backend Jest suite exists (auth, jobs, applications, admin, resumes…); no frontend tests |

## Phase 0 — Access and Backup (blocking, today)

| # | Task | Owner |
|---|---|---|
| 0.1 | Get individual access: Netlify, Render, MongoDB, Cloudinary, Mailgun, OpenAI, domain (view-only) | TriMerge |
| 0.2 | Get `.env` values for `apps/api` and `apps/web` | TriMerge |
| 0.3 | Back up the MongoDB database (`mongodump`) and test a restore locally | Ryan |
| 0.4 | Code backup: done (fork + original repo untouched) | Done |
| 0.5 | Run the API and frontend locally against a **test** database, never production | Ryan |

Without 0.1–0.2, only local work with a local database is possible.

## Phase 1 — Assessment and Testing (Oct 28)

1. Run the backend test suite (`npm test` in `apps/api`) and record results.
2. Test the 5 required workflows end to end: new job seeker, returning candidate, new employer, existing employer managing jobs, administrator (via API).
3. Run Lighthouse and WAVE (free) on the main pages.
4. Log every defect in `docs/issues.md` with severity (critical / high / medium / low).

**Output:** full assessment delivered to TriMerge (the "Initial Deliverable" of the brief).

## Phase 2 — Fix Critical Gaps (Oct 28–29)

Priority order: what blocks normal use first.

| # | Task | Why |
|---|---|---|
| 2.1 | Fix critical defects found in Phase 1 | Core flows must work |
| 2.2 | **Minimal admin dashboard** in `apps/web` on the existing admin API: list/suspend users, list/remove job postings, view applications | Required by the brief; backend already exists |
| 2.3 | **EEO Statement page** + footer link | Required by the brief |
| 2.4 | Check that all legal pages match real operations and use careers@trimergeconsulting.com | Required by the brief |
| 2.5 | Set `NEXT_PUBLIC_SITE_URL`, add `robots.txt`, page titles and meta descriptions | SEO, accessibility |
| 2.6 | Fix placeholder and inaccurate copy (About page, homepage); unify "TriMergePRO" branding | Professionalism (copy to be confirmed by TriMerge) |

## Phase 3 — Security, Privacy, Accessibility (Oct 29)

| # | Task |
|---|---|
| 3.1 | Security headers in `netlify.toml` (CSP, frame-ancestors, Referrer-Policy) |
| 3.2 | API review: role checks on every route, rate limiting on auth, input validation (Zod), CORS limited to real origins |
| 3.3 | Resume uploads: file type and size checks; Cloudinary files private or signed URLs only |
| 3.4 | Secrets: confirm no keys in the repo or frontend bundle; `.env.example` complete |
| 3.5 | Accessibility fixes from WAVE/Lighthouse: labels, contrast, keyboard navigation, focus states |
| 3.6 | Document backup and restore procedure (`docs/operations.md`) |

## Phase 4 — UX Polish (Oct 29, time-boxed)

Mobile/tablet responsiveness, clear form errors and success messages, loading states (especially if Render free tier sleeps). Only fixes, no redesign.

## Phase 5 — AI (low cost, human in the loop)

| Feature | Status | MVP? |
|---|---|---|
| Candidate–job AI matching | Exists (OpenAI) | Verify it works, cap usage, show score as advisory only |
| Resume parsing to pre-fill profile | Libraries already installed (`pdf-parse`, `mammoth`) | Yes if time allows: one cheap model call per upload |
| Job description assistant for employers | Not built | Recommendation only |
| "Ask TriMerge AI" widget | Unknown provider | Identify cost and privacy, recommend keep or remove |

Use a small, cheap model with a monthly spending limit. Estimated cost: a few dollars per month at MVP volume (to confirm with real usage).

## Phase 6 — QA and Final Delivery (Oct 30)

1. Retest the 5 workflows on desktop and mobile, Chrome and Firefox/Safari.
2. Deploy to a **staging** Netlify deploy from `dev`; production deploy only after approval.
3. Deliverables:
   - Platform demo (candidate, employer, admin)
   - Summary of completed work (from `CHANGELOG.md`)
   - Testing results
   - Remaining issues with severity
   - Security and accessibility review
   - AI recommendations
   - Technical documentation (`README.md`, `docs/`)
   - Launch-readiness recommendation

## Risks

| Risk | Impact | Mitigation |
|---|---|---|
| Access arrives late | High: can't test real data or deploy | Work locally with a test database; ask today |
| 2-day deadline | High | Strict priority order; admin UI kept minimal; extras become recommendations |
| Render free tier sleeps | Medium: slow first load | Free keep-alive ping or paid plan (approval needed) |
| Copy and legal text need TriMerge input | Medium | Send the list of copy issues early |
| Frontend/backend restructure not in the original repo | Medium | Team decision before merging the fork back |

## Approvals Needed from TriMerge

- Access list in Phase 0
- Copy corrections (About, homepage) and legal page review
- Any paid upgrade (e.g. Render plan) and AI spending limit
- Production deploy
- Adopting the monorepo structure in the original repository
