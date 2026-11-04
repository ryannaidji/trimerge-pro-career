# AI features and cost control

**Author:** Ryan Naidji · **Date:** 2026-11-03

TriMerge asked to keep costs at zero and not depend on OpenAI for now. Every "smart" feature
therefore has a free, rule-based version that works today, and an optional paid AI version that
stays off until it is approved.

| Feature | Free version (active) | Optional AI version | Switch |
|---|---|---|---|
| Resume → profile pre-fill (#34) | Rule-based extractor: email, phone, LinkedIn, headline, years of experience, ~120 sector skills, summary (`resumes/resume-profile-extractor.ts`) | Not needed for now | – |
| Candidate ↔ job matching (#33) | Skill-overlap score on the employer dashboard (`/dashboard/employer/job/:jobId/candidate-matches`) | OpenAI evaluation of each application (`ai-matching/`) | `AI_MATCHING_ENABLED`, `OPENAI_API_KEY` |
| Help assistant (#35) | Offline FAQ with keyword matching (`web/app/components/ui/helpFaq.ts`) | Could call an LLM later behind the same `findAnswer` interface | – |

## Resume pre-fill (#34)

1. The candidate picks a resume on onboarding step 1.
2. The browser sends it to `POST /api/v1/resumes/parse` (candidates only). The file is checked
   (magic bytes), its text is extracted in memory with `pdf-parse` / `mammoth`, and **nothing is stored**.
3. The API returns suggestions. Only **empty** fields are filled (phone, job title, experience
   range, LinkedIn); skills and summary are pre-filled on step 2. A status message tells the
   candidate what was filled so they can check it.

Tested with a generated PDF: all 7 fields extracted correctly; 6 unit tests in
`tests/resume-extractor.test.ts`.

## AI matching safeguards (#33)

- **Off by default** (`AI_MATCHING_ENABLED=false`). With no `OPENAI_API_KEY`, matching is skipped
  silently instead of failing applications with a 500 (it used to throw).
- **Monthly cap**: `AI_MATCHING_MONTHLY_LIMIT` (default 500) counts evaluations this calendar month
  and skips further calls. Also set a hard spending limit in the OpenAI dashboard.
- **Retry** returns a clear 400 when AI is disabled.
- **Advisory only**: the applicant view states that scores are advisory and humans decide.
- **Estimated cost if enabled** (`gpt-4.1-mini`, ~3k input + 500 output tokens per application):
  roughly $0.002 per application, so 500 applications ≈ $1/month. Prices change; check before enabling.

## Before enabling any paid AI

- Approval from TriMerge, plus an individual API key with a spending limit.
- Update the Privacy Policy (the "Resume Processing and Automated Tools" section already says it will be updated first).
- Review bias risk: AI scores must never auto-reject; keep the human decision.
