# Local development without paid services

**Author:** Ryan Naidji

The platform runs fully on a developer machine with **no third-party account**
(no Mailgun, Cloudinary, OpenAI, Netlify or Render). Each external service has a
free local replacement selected by an environment variable.

| Concern | Local default | Production option | Variable |
|---|---|---|---|
| Database | MongoDB 7 in Docker (`mongo` service) | Any MongoDB (e.g. Atlas free tier) | `MONGODB_URI` |
| Email | `console`: emails and OTP codes are printed in the API logs | `mailgun` | `MAIL_DRIVER` |
| File storage | `local`: files written to `apps/api/uploads/` and served at `/uploads/...` | `cloudinary` | `STORAGE_DRIVER`, `UPLOADS_DIR`, `PUBLIC_API_URL` |
| AI matching | disabled | OpenAI | `AI_MATCHING_ENABLED`, `OPENAI_API_KEY` |

## Getting a verification code locally

With `MAIL_DRIVER=console`, register an account, then read the code in the API logs:

```sh
docker compose logs -f api   # look for "📧 [email:console]"
```

## Local file storage

- Files get a random 128-bit name (`<32 hex chars>.<ext>`); the original file name is
  never used on disk, which prevents path traversal and URL guessing.
- `uploads/` is git-ignored. In Docker it is stored in the `api-uploads` volume.

## Logging and errors

- The API never logs the MongoDB URI, tokens, request bodies or OTP codes
  (except through the `console` email driver, which exists only for local use).
- Error responses never contain stack traces; they are logged server side only.
- CORS is an explicit allowlist (`CORS_ORIGIN`); `*` is rejected and production
  origins must use HTTPS.

## Security controls (summary)

| Control | Where |
|---|---|
| Rate limiting (auth: 10 / 15 min per IP + email; API: 600 / min per IP) | `apps/api/src/middleware/rate-limit.ts` |
| Role checks on every private route (see `docs/security-review.md`) | `apps/api/src/modules/*/*.routes.ts` |
| Upload content validation (magic bytes) | `apps/api/src/lib/storage.ts` |
| Web security headers (CSP, HSTS, frame, referrer) | `apps/web/next.config.ts` |

## Automated tests

| Suite | Command | What it covers |
|---|---|---|
| API unit/integration | `cd apps/api && npm test` | 33 Jest tests (in-memory MongoDB) |
| Workflows | `node scripts/e2e-workflows.mjs` (or `npm run test:workflows`) | 52 checks: all five user profiles and access control |
| Browser | `cd e2e && npm ci && npx playwright test` | 56 Playwright tests on desktop and mobile: public and logged-in pages, axe accessibility, no horizontal overflow |

All three run in GitHub Actions (`.github/workflows/ci.yml`, job `e2e` starts the Docker stack).
