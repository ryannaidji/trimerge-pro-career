# Security review — API authorization, inputs and uploads

**Author:** Ryan Naidji · **Date:** 2026-11-03 · **Scope:** `apps/api` (all routes), `apps/web` headers

## 1. Route authorization matrix (#19)

Every route was listed from `apps/api/src/modules/*/*.routes.ts` and checked for
authentication (`requireAuth`), role (`requireRole`) and ownership (in the service).

| Area | Routes | Auth | Role | Ownership check |
|---|---|---|---|---|
| Auth / onboarding (public) | register, verify, resend, login, forgot/reset password, refresh | – | – | n/a · rate limited |
| Auth | `GET /auth/me`, `GET /onboarding/status`, `PATCH /settings/change-password` | ✔ | any | own account |
| Candidate onboarding | `POST /onboarding/candidate/step-2`, `step-3` | ✔ | TALENT | own profile |
| Employer onboarding | `POST /onboarding/recruiter/step-2`, `step-3` | ✔ | EMPLOYER | own profile |
| Candidate profile | `POST /candidates`, `GET/PUT /candidates/me` | ✔ | TALENT | own profile |
| Candidate profile by id | `GET /candidates/:id` | ✔ | **EMPLOYER, ADMIN** (was: any user) | – |
| Employer profile | `POST /employers`, `GET/PUT /employers/me` | ✔ | EMPLOYER | own profile |
| Employer profile by id | `GET /employers/:id` | ✔ | any | public company info |
| Jobs | `POST /jobs`, `GET /jobs/employer/*` | ✔ | EMPLOYER | own jobs |
| Jobs | `PUT/DELETE /jobs/:id` | ✔ | EMPLOYER | `job.employerId === user` |
| Jobs | `GET /jobs`, `GET /jobs/:id` | ✔ | any | – |
| Public jobs | `GET /public/jobs`, `GET /public/jobs/:id` | – | – | open jobs only |
| Applications | `POST /applications` | **✔ (was: none)** | **TALENT (was: none)** | candidate = user |
| Applications | `GET /applications/my-applications` | ✔ | TALENT | own applications |
| Applications | `GET /applications`, `GET /applications/job/:jobId`, `PATCH /:id/status`, `POST /:id/ai-match/retry` | ✔ | EMPLOYER | `job.employerId === user` |
| Bookmarks | all | ✔ | TALENT | own bookmarks |
| Resumes | `POST /resumes/upload` | ✔ | TALENT | own profile |
| Company logo | `POST /settings/company-logo` | ✔ | EMPLOYER | own profile |
| Dashboard | `/dashboard/candidate/*`, `/dashboard/employer/*` | ✔ | TALENT / EMPLOYER | own data |
| Admin | `/admin/users*`, `/admin/jobs*` | ✔ | ADMIN | – (admins cannot be deleted) |

Admin accounts cannot be self-registered (`accountType` is limited to `EMPLOYER`/`TALENT`);
they are created with `apps/api/src/scripts/create-admin.ts`.

### Findings fixed

| Severity | Finding | Fix |
|---|---|---|
| Critical | `POST /applications` had `requireAuth`/`requireRole` and the service checks commented out: anyone could submit applications, and `candidateId` was not saved, so candidates never saw their own applications | Auth, role and service checks restored; `candidateId` saved |
| High | `GET /candidates/:id` returned personal data and resume links to any signed-in user, including other candidates | Restricted to employers and admins |
| Medium | Search and location filters passed user input directly to MongoDB `$regex` (ReDoS / regex injection) | `escapeRegex()` in admin, jobs and public jobs services |
| Medium | Invalid ObjectIds in URLs returned 500 | `CastError` → 400 |

## 2. Inputs and abuse (#20)

- Every body/query is validated with Zod (`validateRequest`); passwords ≥ 12 chars.
- Rate limits: 10 attempts / 15 min per IP + email on auth/OTP/reset; 600 req/min per IP globally.
- JSON body limit 1 MB; malformed JSON → 400.

## 3. Uploads (#21)

- Size limits: 5 MB documents, 3 MB logos (multer).
- Allowed types checked three ways: extension, browser MIME type **and file signature (magic bytes)**.
- Stored under random 128-bit names; never the original name.
- Served with `X-Content-Type-Options: nosniff`, `Content-Security-Policy: default-src 'none'; sandbox`
  and `Content-Disposition: attachment` for documents.
- Remaining risk: local `/uploads` URLs are unguessable but not authenticated. Before launch,
  use signed, expiring URLs (Cloudinary private delivery or an authenticated download route).

## 4. Web headers (#18)

CSP, HSTS, `X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy`, `Permissions-Policy`, COOP,
no `X-Powered-By` (`apps/web/next.config.ts`). The API uses Helmet.

## 5. Remaining recommendations

- Tokens are stored in `localStorage` (readable by any XSS). Moving to `HttpOnly` cookies is
  recommended but is an architectural change that needs approval.
- Suspended users keep a valid access token until it expires (15 min).
