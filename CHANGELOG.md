# Changelog

**Author:** Ryan Naidji

All notable changes to this project are documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added
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
- Brand name unified to "TriMergePRO" across the web app (#15).
- About page: removed placeholder and unverified copy (fake benefits, developer jargon); homepage no longer calls the platform a firm (#14).
- Footer legal links are now absolute, so they work from nested pages.
- Docker Compose: MongoDB published on `127.0.0.1:27018` only, uploads volume, local email/storage drivers.
- Mailgun and Cloudinary variables are now optional; they are only required when their driver is selected.

### Fixed
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
