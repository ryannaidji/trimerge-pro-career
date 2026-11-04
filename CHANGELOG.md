# Changelog

**Author:** Ryan Naidji

All notable changes to this project are documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added
- Local email driver (`MAIL_DRIVER=console`): emails and OTP codes are printed in the API logs, so no Mailgun account is needed locally.
- Storage abstraction (`apps/api/src/lib/storage.ts`) with a local disk driver (`STORAGE_DRIVER=local`) next to Cloudinary; files get random names.
- API tests for the local storage driver, error handling and CORS (26 tests in total).
- `docs/local-development.md`.
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

### Changed
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
