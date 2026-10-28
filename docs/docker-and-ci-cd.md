# Docker and CI/CD

**Author:** Ryan Naidji
**Date:** 2026-10-28
**Issues:** #16, #26, #27, #28, #29

How to run the whole platform with Docker, and how the GitHub Actions pipelines work.

## Docker

### Services

| Service | Image | Port | Notes |
|---|---|---|---|
| `mongo` | `mongo:7` | 27017 | Local database, data kept in the `mongo-data` volume |
| `api` | `apps/api/Dockerfile` | 4000 | Express API, health check on `/health` |
| `web` | `apps/web/Dockerfile` | 3000 (`WEB_PORT`) | Next.js standalone server |

### Run locally

```bash
cp apps/api/.env.example apps/api/.env   # fill in Mailgun/Cloudinary/OpenAI if needed
docker compose up --build
```

- Web: http://localhost:3000
- API: http://localhost:4000 (Swagger at `/api-docs`)
- Port 3000 taken? `WEB_PORT=3100 docker compose up --build`
- Stop: `docker compose down` (add `-v` to also delete the local database)

Compose overrides `MONGODB_URI` and `CORS_ORIGIN` so the stack always uses the local MongoDB. **Never point it at the production database.**

### Images

- **API:** two-stage build. TypeScript is compiled in the first stage; the final image only has production dependencies and `dist/`, and runs as the non-root `node` user.
- **Web:** built with `output: "standalone"` (enabled by `NEXT_OUTPUT=standalone`, so Netlify builds are unchanged). `NEXT_PUBLIC_*` variables are inlined at build time, so they are **build arguments**, not runtime variables.

### Netlify Functions outside Netlify

The frontend calls `/.netlify/functions/<name>`, which only exists on Netlify. To run the same code in Docker:

- `app/api/netlify-functions/[name]/route.ts` imports every handler from `functions/` and converts a Next.js request into a Netlify event (method, headers, body, query string) and the result back into a response (including multi-value headers such as `Set-Cookie`).
- `next.config.ts` rewrites `/.netlify/functions/:name` to that route **only when not building on Netlify** (`NETLIFY !== "true"`). On Netlify the real functions still serve the requests.
- The functions call the API with `BASEURL`, set to `http://api:4000` inside the Docker network.

### Environment variables

| Variable | Where | Purpose |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | web, build arg | API URL used by the browser. Defaults to production if unset. |
| `NEXT_PUBLIC_SITE_URL` | web, build arg | Public site URL (sitemap) |
| `BASEURL` | web, runtime | API URL used by the Netlify Functions (server side) |
| `SITE_URL` | web, runtime | Server-side site URL |
| `apps/api/.env` | api | See `apps/api/.env.example` |

## Fixes Made Along the Way

| Problem | Fix |
|---|---|
| The production API URL was hard-coded 28 times in 22 frontend files, so local and staging builds wrote to the production database (#16). | Single constant `API_URL` in `app/util/apiUrl.ts`, read from `NEXT_PUBLIC_API_URL`. Production default is unchanged. |
| The API crashed at startup without `OPENAI_API_KEY`, although the key is optional. 9 of 10 test suites failed for this reason. | The OpenAI client is now created on first use (`getOpenAI()` in `ai-match.service.ts`). |
| `tests/resume.test.ts` expected an exact update object and broke when the service started saving more resume fields. | The assertion now checks the relevant fields with `expect.objectContaining`. |
| `apps/api/.env.example` was missing `CLOUDINARY_URL` and the OpenAI variables; `apps/web` had no `.env.example`. | Both completed. |

Result: **19/19 API tests pass**, the frontend typechecks and builds, and the Docker stack was tested end to end (pages, API health, CORS, function adapter, no production URL in the local bundle).

## CI/CD (GitHub Actions)

### CI — `.github/workflows/ci.yml`

Runs on every push to `main`, `dev`, `feat/**`, `fix/**` and on pull requests to `main` and `dev`.

| Job | Steps |
|---|---|
| API | `npm ci`, `npm test` (in-memory MongoDB, placeholder env), `npm run build` |
| Web | `npm ci`, `npm run lint` (non-blocking), `tsc --noEmit`, `npm run build` |
| Docker | Builds both images (not pushed), after the two jobs above pass |

**Lint is non-blocking** because the existing code already has lint errors (`any` types, `setState` in effects). Make it blocking once they are fixed.

### CD — `.github/workflows/cd.yml`

Runs on push to `main`, on `v*` tags, or manually.

- Builds and publishes `ghcr.io/ryannaidji/trimerge-api` and `ghcr.io/ryannaidji/trimerge-web` to GitHub Container Registry (free).
- Tags: `latest` (main), `sha-<commit>`, and the version for `v*` tags.
- Web build arguments come from the repository variables `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_SITE_URL`, with production defaults.

**No automatic deployment to a server yet.** Production hosting (keep Netlify + Render, or move to a Docker host) needs TriMerge approval (#30). Netlify and Render keep working as before.

### Recommended branch protection

Once CI has run once, require the `API · test & build` and `Web · lint & build` checks on `main` and `dev`.
