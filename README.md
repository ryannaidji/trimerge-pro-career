# TriMerge Pro Career

**Author:** Ryan Naidji
**Last updated:** 2026-10-28

Monorepo for the TriMerge Pro Career platform: a job board connecting candidates and recruiters.

## Structure

| Path | Description |
|---|---|
| `apps/web` | Frontend — Next.js, Tailwind CSS, Netlify Functions |
| `apps/api` | Backend API — Node.js, Express, MongoDB (Mongoose), JWT auth, Mailgun |
| `docs` | Project documentation |
| `CHANGELOG.md` | History of notable changes |

## Getting Started

### With Docker (recommended)

```bash
cp apps/api/.env.example apps/api/.env
docker compose up --build   # web :3000, API :4000, MongoDB :27017
```

See [Docker and CI/CD](docs/docker-and-ci-cd.md). Without Docker, each app is installed and run independently:

### Frontend (`apps/web`)

```bash
cd apps/web
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm run lint
```

Environment variables: see `apps/web/.env.example` (`NEXT_PUBLIC_API_URL` selects the API; defaults to production).

### Backend (`apps/api`)

```bash
cd apps/api
cp .env.example .env   # then fill in the values
npm install
npm run dev      # http://localhost:4000 — Swagger at /api-docs
npm test
npm run build && npm start
```

See `apps/api/.env.example` for the required variables (MongoDB, JWT, CORS, Mailgun).

## Branching Workflow

| Branch | Purpose |
|---|---|
| `main` | Production. Protected — changes only through pull requests from `dev`. |
| `dev` | Integration. Feature branches are merged here via pull request. |
| `feat/*`, `fix/*` | Short-lived work branches created from `dev`. |

```bash
git switch dev && git pull
git switch -c feat/my-feature
# commit, then push and open a pull request into dev
git push -u origin feat/my-feature
```

## CI/CD

GitHub Actions run tests and builds on every push and pull request, and publish Docker images to GitHub Container Registry on `main`. See [Docker and CI/CD](docs/docker-and-ci-cd.md).

## Deployment

The frontend deploys to Netlify (`apps/web/netlify.toml`):

- Base directory: `apps/web`
- Production branch: `main`
- Branch deploys: `dev` (staging); deploy previews for pull requests

## Documentation

- [MVP launch plan](docs/launch-plan.md)
- [Docker and CI/CD](docs/docker-and-ci-cd.md)
- [Project issues and milestones](https://github.com/ryannaidji/trimerge-pro-career/milestones)
- [Repository restructure](docs/repository-restructure.md)
- [Auth flow](docs/auth-flow.md)
- [Backend QA checklist](docs/backend-qa-checklist.md)
- [Frontend / backend handoff](docs/frontend-backend-handoff.md)
- [Frontend changes report](apps/web/FRONTEND_CHANGES_REPORT.md)

## Contributing

- Write all code, comments, commits and documentation in English.
- Record notable changes in [CHANGELOG.md](CHANGELOG.md).
- Document as you go: every feature, decision or setup change gets docs in `docs/` (or the app README) in the same pull request.
