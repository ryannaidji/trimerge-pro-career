# Secrets management

**Author:** Ryan Naidji · **Reviewed:** 2026-11-03 (#22)

## Rules

1. Secrets live only in environment variables: `apps/api/.env` and `apps/web/.env` locally
   (git-ignored), and the Render / Netlify dashboards in production. Never in code or docs.
2. Only `NEXT_PUBLIC_*` variables reach the browser. Today these are `NEXT_PUBLIC_API_URL` and
   `NEXT_PUBLIC_SITE_URL` (public URLs, no secrets).
3. Each person gets an individual account on each service; no shared admin passwords (#1).
4. Generate secrets with a CSPRNG, e.g.
   `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`.

## Inventory

| Variable | Used by | Secret? | Local value |
|---|---|---|---|
| `MONGODB_URI` | API | **Yes** (contains DB password) | Docker `mongo` service, no password |
| `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` | API | **Yes** | random, generated locally |
| `MAILGUN_API_KEY` | API (`MAIL_DRIVER=mailgun`) | **Yes** | not set (`console` driver) |
| `CLOUDINARY_URL` | API (`STORAGE_DRIVER=cloudinary`) | **Yes** | not set (`local` driver) |
| `OPENAI_API_KEY` | API (AI matching) | **Yes** | not set (AI disabled) |
| `CORS_ORIGIN`, `PUBLIC_API_URL`, `NEXT_PUBLIC_*`, `BASEURL`, `SITE_URL` | API / web | No | localhost URLs |

## Review results

- **Git history:** gitleaks 8.21.2 scanned all 107 commits: **no leaks**. Only `.env.example`
  files were ever committed. The scan now runs in CI on every push (`secrets` job).
- **Browser bundle:** the built `.next/static` contains no database URI, API keys or JWT secrets.
- **Logs:** the API printed the full `MONGODB_URI` at startup until #17. If that code ran on
  Render, the production database password is in Render's logs.

## Recommended rotation (needs production access)

| Secret | Why | When |
|---|---|---|
| MongoDB password | was printed in startup logs (#17) | as soon as access is granted |
| `JWT_*` secrets | unknown history; rotating signs everyone out once | before launch |
| Mailgun / Cloudinary / OpenAI keys | shared accounts, unknown holders | when individual accounts are created (#1) |
