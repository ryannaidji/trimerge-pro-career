# TriMerge Pro Career — Frontend

**Author:** Ryan Naidji
**Last updated:** 2026-10-28

Next.js frontend of the TriMerge Pro Career platform. Part of the monorepo — see the [root README](../../README.md).

## Commands

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
npm start
npm run lint
```

## Structure

| Path | Description |
|---|---|
| `app/` | Routes, pages and components (App Router) |
| `contexts/` | React context providers |
| `hooks/` | Custom React hooks |
| `functions/` | Netlify Functions |
| `public/` | Static assets |

## Environment Variables

| Variable | Purpose |
|---|---|
| `BASEURL` | Backend API base URL |
| `NEXT_PUBLIC_SITE_URL` | Public site URL (client side) |
| `SITE_URL` | Site URL (server side, e.g. sitemap) |

## Deployment

Deployed on Netlify via `netlify.toml` with `@netlify/plugin-nextjs`. Set the Netlify base directory to `apps/web`.

## Notes

This project uses a Next.js version with breaking changes — read `AGENTS.md` before editing code.
