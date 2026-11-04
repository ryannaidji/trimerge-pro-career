# Platform demonstration script

**Author:** Ryan Naidji · **Duration:** about 20 minutes · **Environment:** local Docker stack

## Before the demo (5 minutes)

```sh
docker compose up -d --build           # web http://localhost:3000, API http://localhost:4000
docker compose logs -f api             # keep open: verification codes appear as "📧 [email:console]"
```

- Admin account: `admin@trimerge.local` / `Admin-Local-2026!` (local only; create with
  `docker compose exec -e ADMIN_EMAIL=... -e ADMIN_PASSWORD=... api node dist/scripts/create-admin.js`).
- Have a PDF resume ready. Use two browser windows (one normal, one private) for employer and candidate.
- Optional proof that everything works: `node scripts/e2e-workflows.mjs` (52 checks, about 30 s).

## 1. Visitor (2 min)

1. Home page: branding, search bar, sectors. Mention the 100/100/100 Lighthouse scores.
2. **Browse jobs** without an account, then open a job. Shrink the window to phone size: the list stacks and the job opens full screen.
3. Footer: Privacy Policy, Terms, Accessibility Statement, **EEO Statement**.
4. **Ask TriMerge**: type "how do I apply?" (free FAQ, no AI cost, nothing sent outside).

## 2. New employer (5 min)

1. **Join now → Employer**: register; show the verification code arriving in the logs; enter it.
2. Company onboarding (2 steps).
3. **Post a Job**: title "Cybersecurity Analyst" → location (country, state, free-text city) → step 4, **Draft from job title** fills the description; type "young rockstar" to show the **inclusive-language check**; publish.
4. Dashboard: the posting appears; edit it.

## 3. New job seeker (5 min)

1. **Join now → Candidate** in the private window; verify the email.
2. Step 1: choose the PDF resume, and the phone, job title, experience and LinkedIn **pre-fill** from it (no AI). Step 2: skills and summary are pre-filled too.
3. Browse jobs, then **Apply** to the employer's job. Applying twice is refused.
4. **My applications**: the application appears with its status.

## 4. Existing employer (3 min)

1. Back in the employer window: **Candidates**, where the new applicant appears; **shortlist** them.
2. Candidate window: the status changes to *Shortlisted* (the email is in the logs).
3. **Find talent**: search the skill "Cybersecurity" or "NIST" to find candidates who did not apply; no email or resume text is exposed.

## 5. Administrator (3 min)

1. Log in as admin, which redirects to `/admin`.
2. Search the employer, **suspend** them, and show that their login is refused. Then reactivate.
3. **Jobs** tab: close a posting.

## 6. Wrap-up (2 min)

- Security: authorization audit, rate limiting, upload checks, no secrets in logs (`docs/security-review.md`).
- Tests: 33 API tests + 52 workflow checks + 56 browser tests, all running in GitHub Actions.
- Decisions needed (`docs/final-report.md` §4): access (#1), production backup (#3), hosting (#30), staging (#37), upstream proposal (#39), npm workspaces (#42).
