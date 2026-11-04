# Lighthouse and accessibility audits

**Author:** Ryan Naidji · **Date:** 2026-11-03 · **Target:** local Docker stack (`http://localhost:3000`)

Tool: Lighthouse 12.2.1 (free, runs Google's axe-core accessibility rules), headless Chrome.
WAVE is a browser extension; Lighthouse/axe covers the same automated WCAG checks and can be
scripted. Responsive checks: puppeteer-core at 375 px (phone) and 768 px (tablet).

## Scores (mobile emulation unless stated)

| Page | Accessibility (before → after) | Best practices | SEO |
|---|---|---|---|
| Home | 100 → 100 | 100 | 100 |
| About | 98 → 100 | 100 | 100 |
| Browse jobs | 94 → 100 | 100 | 100 |
| Log in | 96 → 100 | 100 | 100 |
| Join now | 96 → 100 | 100 | 100 |
| Employers | 100 → 100 | 100 | 100 |
| EEO statement | 100 | 100 | 100 |
| Privacy policy / Terms / Accessibility statement | 100 | 100 | 100 |

Home, desktop preset: **Performance 99** (LCP 0.9 s, TBT 20 ms).
Mobile performance traces failed to record on this Windows machine (`NO_NAVSTART`, a known
headless Chrome issue); re-run in CI or on another machine before launch.

## Accessibility issues fixed (#24)

| Rule | Page | Fix |
|---|---|---|
| `heading-order` | About | "What the platform offers" h3 → h2 |
| `heading-order` | Browse jobs | Added a visually hidden "Job listings" h2 before the job cards (h3) |
| `color-contrast` (2.45:1) | Browse jobs | `#94a3b8` → `#64748b` (4.76:1) |
| `target-size` (16 px) | Log in, Join now, Reset password | Password visibility toggles are now 40 × 40 px |
| Missing labels | Browse jobs search, change password, OTP digits | `aria-label`s and `autocomplete` added |
| Invisible keyboard focus | All pages | Inline `outline: none` was hiding focus; focus ring forced (`!important`), solid `#1d4ed8` (> 3:1) |
| Motion | All pages | `prefers-reduced-motion` disables animations |

## Responsive issues fixed (#31)

| Width | Page | Problem | Fix |
|---|---|---|---|
| 375 px | Navbar | "Log In" / "Sign-up" wrapped on two lines | Log In moves to the menu under 640 px (the old `hidden` class was overridden); no wrapping |
| 375–899 px | Browse jobs | List and detail panel squeezed side by side, detail cut off | Layout stacks; job details open as a full-screen panel |
| 375 px | Browse jobs | Dual search bar truncated | Search fields stack vertically |

No page scrolls horizontally at 375 px or 768 px.

## Not covered by automated tools

Automated checks find about 30–40% of WCAG issues. Before launch: test with a screen reader
(NVDA on Windows is free), keyboard-only through every form, and 200% zoom. The logged-in pages
(dashboards, onboarding) still need the same audit with a test account.
