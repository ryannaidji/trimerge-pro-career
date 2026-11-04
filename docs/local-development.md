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
