# Repository Restructure

**Author:** Ryan Naidji
**Date:** 2026-10-28

This document explains how the original GitHub repository was analyzed and restructured into the current monorepo.

## 1. Starting Point

The original repository is [TriMergeTech/trimerge-pro-career](https://github.com/TriMergeTech/trimerge-pro-career). It was left **unchanged**: all work was done in the fork [ryannaidji/trimerge-pro-career](https://github.com/ryannaidji/trimerge-pro-career).

### Problems found

- **10 branches**, most of them stale, with no `main` or `dev` branch.
- The default branch, `feature/auth-module`, was the **oldest** active branch (last commit 2026-04-27), so new clones got outdated code.
- The frontend and backend lived on **two branches with no common history**, so they could not be merged, and no branch contained the whole project.
- No deployment information on GitHub. The frontend was probably deployed by Netlify from `feat/frontend-update`, since that branch had the only `netlify.toml`.

### Branch analysis

Each branch was checked with `git merge-base --is-ancestor` to see whether its commits were already contained in one of the two active branches.

| Branch | Last commit | Result |
|---|---|---|
| `feat/backend` | 2026-08-05 | **Active backend** (`apps/api`, `docs`) |
| `feat/frontend-update` | 2026-08-04 | **Active frontend** (Next.js). All 5 merged pull requests target it. |
| `fix/Job-creation` | 2026-07-31 | Contained in `feat/frontend-update` (PR #5) |
| `sign-Up-Fix` | 2026-07-13 | Contained in `feat/frontend-update` (PR #2) |
| `feat/old-backup` | 2026-07-11 | Contained in `feat/frontend-update` |
| `feature/backend-core` | 2026-06-10 | Contained in `feat/backend` |
| `FinalBranch` | 2026-06-04 | Contained in `feat/frontend-update` |
| `MergedBranch` | 2026-06-01 | Contained in `feat/frontend-update` |
| `feature/auth-module` (old default) | 2026-04-27 | Contained in `feat/backend` |
| `wilsonNextJSFrontend` | 2026-04-27 | Contained in `feat/frontend-update` |

**Conclusion:** only `feat/backend` and `feat/frontend-update` held unique work. Every other branch could be deleted without losing anything.

## 2. Fork and Safety Setup

```bash
gh repo fork TriMergeTech/trimerge-pro-career --clone --default-branch-only=false
git remote set-url --push upstream no_push
```

- `origin` points to the fork (fetch and push).
- `upstream` points to the original repository (fetch only). Any push to it fails.
- Local Claude Code rules (`CLAUDE.local.md`, `.claude/settings.local.json`, both git-ignored) forbid any change to the original repository.

## 3. Merging Frontend and Backend

The backend already used a monorepo layout (`apps/api`) and its README already planned for `apps/web`, so the frontend was moved there.

```bash
# 1. Move the frontend into apps/web
git switch -c web-move origin/feat/frontend-update
mkdir -p apps/web
for f in $(git ls-tree --name-only HEAD); do git mv "$f" apps/web/; done
git commit -m "Move frontend into apps/web for monorepo layout"

# 2. Create main from the backend and merge the frontend into it
git switch -c main origin/feat/backend
git merge --allow-unrelated-histories web-move
```

- No conflicts: the frontend files all live under `apps/web/`.
- The **full history of both branches is kept** (110 commits on `main`).
- Source commits: backend `3308bf0`, frontend `163a0c8`. Merge commit: `c24866f`.
- Check: `npm ci && npm run build` passes in `apps/web`.

Resulting layout:

```
apps/
  api/   backend (Express, MongoDB)
  web/   frontend (Next.js, Netlify)
docs/
README.md
CHANGELOG.md
```

## 4. Branching Model

| Branch | Role |
|---|---|
| `main` | Production and default branch. Protected: changes through pull requests only, no force-push, no deletion. |
| `dev` | Integration. Created from `main`. |
| `feat/*`, `fix/*` | Work branches from `dev`, merged back into `dev` through pull requests. |

No separate `test` branch: Netlify branch deploys of `dev` serve as staging, and every pull request gets a deploy preview.

```bash
git push -u origin main
git branch dev main && git push -u origin dev
gh repo edit ryannaidji/trimerge-pro-career --default-branch main
```

## 5. Cleanup

The 10 old branches were deleted from the fork (`git push origin --delete <branch>`), since all their commits are in `main`. They still exist in the original repository.

## 6. Documentation

- Rewrote the root `README.md` and `apps/web/README.md`.
- Added `CHANGELOG.md`, a root `CLAUDE.md` (project rules, English only) and this document.

## 7. Open Points

- **npm workspaces:** not set up. Each app is installed separately. The root `package.json` has stray dependencies that should be cleaned up first.
- **Netlify:** to deploy from the monorepo, set Base directory to `apps/web` and Production branch to `main`.
- **Original repository:** applying this structure to `TriMergeTech/trimerge-pro-career` needs a decision by the team and someone with admin rights there.
- **Environment files:** `.env` files are not in the repository and must come from the team.
