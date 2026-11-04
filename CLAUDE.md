# Project rules for Claude Code

- All outputs must be in English: code comments, commit messages, documentation, changelog and generated files.
- Record every notable change in `CHANGELOG.md` (Keep a Changelog format).
- Document continuously: every feature, architecture decision or setup change must be documented in `docs/` (or the relevant README) as part of the same work, with author "Ryan Naidji".
- Monorepo layout: frontend in `apps/web` (see `apps/web/CLAUDE.md`), backend in `apps/api`, docs in `docs/`.
- Branches: `main` = production (PR only), `dev` = integration, `feat/*` / `fix/*` from `dev`.
