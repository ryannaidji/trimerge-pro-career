# Changelog

**Author:** Ryan Naidji

All notable changes to this project are documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added
- `docs/repository-restructure.md`: how the original repository was analyzed and restructured.
- Rule to document continuously during development (`CLAUDE.md`, README).

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
