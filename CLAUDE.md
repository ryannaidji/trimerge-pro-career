# Project rules for Claude Code

- All outputs must be in English: code comments, commit messages, documentation, changelog and generated files.
- Record every notable change in `CHANGELOG.md` (Keep a Changelog format).
- Monorepo layout: frontend in `apps/web` (see `apps/web/CLAUDE.md`), backend in `apps/api`, docs in `docs/`.
- Branches: `main` = production (PR only), `dev` = integration, `feat/*` / `fix/*` from `dev`.
