# Phase 2 plan — feature completion

**Author:** Ryan Naidji · **Date:** 2026-11-04

## Why a phase 2

Phase 1 (milestones M0–M6) made the platform run locally, secured the API, fixed the critical
bugs and added tests. An audit that compared every API route with what the website actually calls
showed that **several features exist in the API but have no page or button**, so users can't
reach them. Phase 2 closes those gaps, finishes account and session handling, and prepares launch.

## Audit summary (2026-11-04)

| Area | Gap |
|---|---|
| Employer | Cannot shortlist, reject or hire applicants from the site (`PATCH /applications/:id/status` is never called) |
| Employer | No company logo upload; dashboard statistics endpoints unused |
| Candidate | No menu: "My applications" is reachable only by typing the URL |
| Candidate | No "My profile" page after onboarding: cannot edit the profile or skills, or replace the resume |
| Candidate | No "Save job" button or saved-jobs list (bookmarks API unused) |
| Candidate | No job recommendations, although Gerri listed "intelligent recommendations" |
| Accounts | Access token expires after 15 min and is never refreshed, so users are signed out mid-task |
| Accounts | Logout doesn't revoke the refresh token on the server |
| Accounts | "Change password" page is a mockup (no API call, not linked); no self-service account deletion |
| Accounts | Two MFA pages are mockups with no backend |
| Privacy | Resume URLs are public (unguessable but not authenticated); candidates cannot opt out of talent search |
| Data | Job departments (Engineering, Marketing…) don't match TriMerge's sectors |
| Quality | Pre-existing ESLint errors; lint is non-blocking in CI |

## Milestones

| Milestone | Goal | Who |
|---|---|---|
| **M7 · Candidate & employer features** | Every API feature reachable from the site | Ryan |
| **M8 · Accounts, sessions & privacy** | Users stay signed in safely, manage their account, control their data | Ryan |
| **M9 · Quality & cleanup** | Data and code consistent, lint enforced | Ryan |
| **M10 · Launch readiness** | Everything that needs TriMerge access, decisions or review | TriMerge + Ryan |
| **Post-MVP Backlog** | Approved-later items (architecture, real 2FA) | – |

Phase 1 milestones M0–M6 are closed; their remaining open issues moved to M10 or the backlog.

## Order of work

1. **M7 critical/high first:** applicant status management, candidate menu, My profile, applicant detail view.
2. **M8 high:** session refresh, authenticated resume downloads.
3. Remaining M7/M8 items, then M9.
4. M10 runs in parallel as soon as TriMerge grants access.

Every issue is done on a `feat/*` or `fix/*` branch with tests (workflow checks plus Playwright and
axe), merged into `dev`, and closed with a what/how/why/result comment, and the CHANGELOG is
updated. Everything stays free and local; no production deploy without approval.
