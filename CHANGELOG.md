# Changelog

**Author:** Ryan Naidji

All notable changes to this project are documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added
- Job departments aligned with TriMerge's 12 sectors (Government & Public Sector, Technology, Accounting & Finance, Emergency Management…); legacy values still accepted and shown with readable labels (#62).
- Employer applicant manager: real candidate details, cover letter, documents, search and status filter, and a status control (New, Reviewed, Shortlisted, Not selected, Hired) with email to the candidate (#47, #48).
- Candidate account menu (My applications, Recommended jobs, Saved jobs, My profile, Settings, Log out), keyboard accessible, also in the mobile menu (#49).
- "My profile" page: edit details and skills, replace the resume, "Visible to employers in talent search" setting (#50, #60).
- Saved jobs: "Save job" button (aria-pressed) and `/saved-jobs` page (#51).
- Recommended jobs (rule-based, no AI): `GET /api/v1/recommendations/jobs` and `/recommended-jobs` page (#52).
- Company logo upload in the employer Company tab; company name and logo shown on public job postings (#53).
- Employer dashboard overview numbers (#54).
- Automatic session renewal: `SessionKeeper` refreshes the 15-minute access token before it expires and `authFetch` retries once after a 401 (#55).
- `POST /api/v1/auth/logout` revokes the refresh token; the site calls it on logout (#56).
- Settings page with a working change-password form (the device stays signed in) and self-service account deletion with password confirmation, `DELETE /api/v1/account` (#57, #58).
- Private documents: resumes and cover letters served only through `GET /api/v1/files/:folder/:name` to the owner, employers who received the application, and admins (#59).
- `docs/plan-phase-2.md`: audit of API features missing from the website and the phase 2 plan; GitHub milestones M7–M10 and issues #47–#70 on the fork.
- Local email driver (`MAIL_DRIVER=console`): emails and OTP codes are printed in the API logs, so no Mailgun account is needed locally.
- Storage abstraction (`apps/api/src/lib/storage.ts`) with a local disk driver (`STORAGE_DRIVER=local`) next to Cloudinary; files get random names.
- API tests for the local storage driver, error handling and CORS (27 tests in total).
- `docs/local-development.md`.
- Equal Employment Opportunity Statement page at `/eeo-statement`, linked from the footer (#10).
- `robots.txt` and a sitemap generated with Next.js metadata routes, listing public pages only (#12).
- Page titles and meta descriptions for every route, with a `%s | TriMergePRO Careers` template and Open Graph defaults; private pages are `noindex` (#13).
- Security headers on the web app: CSP, HSTS, X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy, COOP; `X-Powered-By` removed (#18).
- Admin dashboard at `/admin`: search and filter users, suspend/reactivate/delete accounts, search jobs and change their status; admins are redirected there after login (#9).
- `create-admin` script to create or promote an administrator (`apps/api/src/scripts/create-admin.ts`) (#9).
- `scripts/e2e-workflows.mjs`: 30 end-to-end checks of the candidate, employer, visitor, admin and access-control workflows against the Docker stack (#6).
- `scripts/backup-db.sh` / `scripts/restore-db.sh` and `docs/backup-and-recovery.md`; restore verified (#25).
- `docs/security-review.md` (route authorization matrix) and `docs/issues.md` (defect log) (#8, #19).
- `docs/audits.md`: Lighthouse/axe results; all public pages now score 100 for accessibility, best practices and SEO (#7).
- Secret scanning with gitleaks in CI (`secrets` job) and `docs/secrets.md` (inventory, review results, rotation plan) (#22).
- `SlowRequestNotice`: after 4 s of waiting (login, sign-up, job list) users are told the server may be starting up (#32).
- Resume pre-fill without AI: `POST /api/v1/resumes/parse` extracts email, phone, LinkedIn, headline, years of experience, skills and summary with rules (nothing stored); onboarding steps 1 and 2 pre-fill empty fields (#34).
- AI matching safeguards: skipped instead of failing when no OpenAI key, monthly cap `AI_MATCHING_MONTHLY_LIMIT`, clear 400 on retry when disabled, "advisory only" notice; `docs/ai.md` (#33).
- Playwright browser smoke tests in `e2e/` (32 tests, desktop and mobile) and a CI `e2e` job that starts the Docker stack and runs the workflow checks and the browser tests (#44).
- Job description assistant (no AI): "Draft from job title" fills empty sections from role templates; inclusive-language check flags biased wording with suggestions (#40).
- Talent search for employers at `/talent-search` and `GET /api/v1/candidates/search`: keyword, skill and location ranking over active candidates, minimal data returned (#41).
- Local location data replaces countriesnow.space: static country and US state lists, free-text city; the domain is removed from the CSP (#43).
- Root `package.json` with shortcut scripts (`stack:up`, `test:workflows`, `test:browser`...); stray root dependencies and lockfile removed (#42, partial).
- Workflow checks extended to 52 (returning candidate, existing employer, password reset/change, bookmarks, uploads, talent search); Playwright logged-in tests with axe (56 browser tests).
- Cross-browser regression run (Chrome, Edge, Firefox, WebKit desktop and iPhone): `docs/testing-results.md` (#36); `ALL_BROWSERS=1` Playwright projects.
- `docs/final-report.md`: completion report, remaining issues and launch recommendation (#38).
- Login inputs have `name` and `autocomplete` attributes (password managers, accessibility).
- Rate limiting: 10 attempts / 15 min per IP + email on login, registration, OTP and password reset; 600 requests / min per IP on the whole API (#20).
- Docker: `Dockerfile` for `apps/api` and `apps/web`, `docker-compose.yml` with MongoDB (#26).
- Adapter route running the Netlify Functions outside Netlify (#27).
- GitHub Actions CI (API tests and build, web typecheck and build, Docker builds) (#28) and CD publishing images to GHCR (#29).
- `apps/web/.env.example`; missing variables added to `apps/api/.env.example`.
- GitHub milestones (M0–M6, backlog), labels and 45 issues on the fork.
- `docs/docker-and-ci-cd.md`.
- `docs/launch-plan.md`: prioritized plan to reach a launch-ready MVP by 2026-10-30.
- `docs/repository-restructure.md`: how the original repository was analyzed and restructured.
- Rule to document continuously during development (`CLAUDE.md`, README).

### Security
- Removed logs of the MongoDB URI, access tokens, API responses, login responses and OTP codes (#17).
- Error responses no longer include stack traces; malformed JSON returns 400, oversize bodies 413, disallowed origins 403 (#45).
- CORS: `*` is rejected and production origins must be HTTPS; default allowlist reduced to the web origin (#23).
- User-controlled values (job title, status) are HTML-escaped in notification emails.
- JSON request bodies are limited to 1 MB.
- `POST /api/v1/applications` required no authentication (auth was commented out); it now requires a signed-in candidate (#19).
- Applications were saved without `candidateId` (commented out), so candidates never saw their applications.
- Suspended users could keep refreshing tokens for 7 days; refresh now requires an active account and suspension revokes all refresh tokens.
- Search filters escape user input before using `$regex` (ReDoS); invalid ObjectIds return 400 instead of 500.
- `GET /api/v1/candidates/:id` (personal data) is restricted to employers and admins (#19).
- Uploads are validated by content (magic bytes), not only by extension and browser MIME type; uploaded files are served with `nosniff`, a sandbox CSP and `Content-Disposition: attachment` for documents (#21).
- The web app falls back to the local API instead of the production API when `NEXT_PUBLIC_API_URL` is missing.

### Changed
- Privacy policy explains talent-search visibility, the opt-out and that documents are only shared with employers the candidate applies to (#60).
- "Ask TriMerge AI" widget renamed "Ask TriMerge": typed questions are now answered from a built-in FAQ (14 topics, keyword matching in the browser, no AI provider, no cost, no data sent) instead of a canned "I can't answer yet" reply (#35).
- Privacy policy: added Service Providers, Resume Processing and Automated Tools, and Data Retention sections; removed claims about analytics cookies the platform does not use; account deletion is by request (#11). Draft, needs legal review.
- Error messages are announced to screen readers (`role="alert"`) and no longer disappear after 3.5 s on sign-up; blocking `alert()` removed (#32).
- The decorative auth card animation plays once (4.5 s) instead of forever (WCAG 2.2.2; it also blocked automated clicks in WebKit).
- Accessibility: sequential headings, contrast fix, 40 px password toggles, labels on search/password/OTP fields, always-visible keyboard focus, reduced-motion support (#24).
- Responsive: browse jobs stacks on phones with a full-screen job panel; stacked search bar; navbar buttons no longer wrap (#31).
- Brand name unified to "TriMergePRO" across the web app (#15).
- About page: removed placeholder and unverified copy (fake benefits, developer jargon); homepage no longer calls the platform a firm (#14).
- Footer legal links are now absolute, so they work from nested pages.
- Docker Compose: MongoDB published on `127.0.0.1:27018` only, uploads volume, local email/storage drivers.
- Mailgun and Cloudinary variables are now optional; they are only required when their driver is selected.

### Removed
- Dead code: unused components (ActionMenu, ApplicantsList, chart, CreateListingModal, PostJobModal), hooks (useApplicationAIMatch, useAutoAuth, useGetApplicationsForJob, useGetUser), the orphan `/candidate-overview` route and two unused `*Old` API functions (#64).
- MFA mockup pages (`/mfa`, `/mfa/set-up`) that looked functional but did nothing (#61).
- Mockup change-password page (now redirects to Settings).

### Fixed
- ESLint: 0 errors (was 51); lint is now blocking in CI; `set-state-in-effect` kept as a documented warning (#63).
- Resume/cover-letter picker in the application form is a real button (keyboard and screen readers); editor toolbar works with Enter/Space (#63).
- Applying for a job uses the session-renewing fetch, so an expired token no longer fails the application.
- Visitors could open the application form and only get an error at the end; "Apply" now asks them to log in first.
- Account deletion (admin or self-service) now also deletes the user's uploaded files.
- `PUT /candidates/me` creates the profile if the candidate skipped onboarding.
- The job title in the job details panel is now a heading (screen readers).
- Candidate "My applications" page showed hard-coded sample data; it now loads the candidate's real applications and statuses.
- Employer dashboard and "Post a Job" wizard were unusable on phones (page wider than the screen, Next button off-screen).
- 57 low-contrast grey text elements on logged-in pages (WCAG 1.4.3).
- Frontend no longer hard-codes the production API URL; uses `NEXT_PUBLIC_API_URL` (#16).
- API no longer crashes at startup when `OPENAI_API_KEY` is not set.
- Outdated assertion in `tests/resume.test.ts`; all 19 API tests pass.

## 2026-10-28 — Monorepo restructure

### Added
- `CHANGELOG.md` to track notable changes.
- Root `CLAUDE.md` with project rules (English-only outputs, changelog, branching).
- `dev` integration branch; `main` is now the default, protected production branch.

### Changed
- Merged the frontend (`feat/frontend-update`) and backend (`feat/backend`) into a single monorepo on `main`, keeping the full history of both.
- Moved the frontend into `apps/web`; the backend stays in `apps/api`.
- Rewrote the root README: structure, setup, branching workflow, deployment, documentation index.
- Replaced the default Next.js README in `apps/web` with project-specific documentation.

### Removed
- Obsolete branches already contained in `main`: `FinalBranch`, `MergedBranch`, `wilsonNextJSFrontend`, `feat/old-backup`, `sign-Up-Fix`, `fix/Job-creation`, `feature/auth-module`, `feature/backend-core`, `feat/frontend-update`, `feat/backend`.
- Reference to the non-existent `packages/shared` folder from the README.
