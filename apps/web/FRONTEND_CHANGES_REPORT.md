# TriMergePro Career — Frontend Changes Report
**Date:** July 31, 2026
**Prepared for:** Backend Lead
**Prepared by:** Frontend Team

---

## Overview

This report documents all frontend changes made during this development session across the candidate browse-jobs experience, employer job creation wizard, and shared UI components. It also outlines the backend work required to fully support these features.

---

## 1. Browse Jobs Page — Candidate Experience

### 1.1 Footer Removed
**File:** `app/components/Footer.tsx`
The footer is now hidden on `/browse-jobs` for all user types. A `usePathname` check returns `null` on that route.

### 1.2 Navbar — Candidate-Specific Redesign
**File:** `app/components/Navbar.tsx`
- On `/browse-jobs`, the navbar shows only the logo and candidate controls (no nav links, no sign-up button).
- When a candidate is logged in, the navbar displays:
  - A **Log out** button
  - A **profile circle icon** (first initial, gradient background)
  - Clicking the circle opens a dropdown showing "Signed in as" + the account email
  - Clicking outside the dropdown closes it (using `mousedown` event listener + `useRef`)
- These controls (`CandidateControls`) are reused across both the browse-jobs navbar and the general navbar.

### 1.3 Job Listing Cards — Simplified
**File:** `app/components/ui/JobCard.tsx`
- Removed the position summary/description paragraph from job cards.
- Removed the Apply Now button from cards (moved to job detail).
- Removed unused `useUser`, `ArrowRight` imports.

### 1.4 Job Listing — Scrollbar
**File:** `app/(employee)/browse-jobs/page.tsx`
- Replaced `hide-scrollbar` class with `tp-job-scroll` on the job list container.
- Added `paddingRight: '0.5rem'` for spacing.

**File:** `app/styles/index.css`
Added scrollbar styles:
```css
.tp-job-scroll { scrollbar-width: thin; scrollbar-color: rgba(29,78,216,0.25) transparent; }
.tp-job-scroll::-webkit-scrollbar { width: 5px; }
.tp-job-scroll::-webkit-scrollbar-thumb { background: rgba(29,78,216,0.25); border-radius: 999px; }
```

---

## 2. Job Detail Drawer — Cleanup & Redesign

**File:** `app/components/ui/JobDetailDrawer.tsx`

### 2.1 Removed Elements
- Removed the Meta card (Employment Type / Status)
- Removed the "Go to login page" button
- Removed the "View applicants for this job" link
- Removed the "New Posting" badge
- Removed the entire inline apply form (Cover Letter, Screening Questions, "Apply for This Position" button)
- Removed all related state: `coverFile`, `coverError`, `coverType`, `coverText`, `questionAnswers`, `successMessage`
- Removed `useApplyForJob`, `useApplicationAIMatch` hooks from the drawer (moved to the ApplicationWizard)
- Removed `QUESTION_CONFIG`, `QuestionConfig`, `QuestionType` types
- Removed unused `Link`, `useApplyForJob`, `useApplicationAIMatch` imports

### 2.2 Metadata Reformatted
The job metadata (Department, Location, Compensation, Work Arrangement, Work Schedule, Posted) is now a vertical stack using icon + label + value rows, without card boxes.

### 2.3 Apply Now Button
- Added a compact Apply Now button directly under the metadata stack.
- Visible only to non-employer users.
- For logged-in TALENT: calls `onApply?.()` to open the ApplicationWizard.
- For unauthenticated users: redirects to `/login`.
- Added `onApply?: () => void` to `JobDetailDrawerProps`.

### 2.4 Benefits Section (NEW)
Added a **Benefits & Perks** section below Skills in the drawer.
- Benefits are grouped by category (Health & Wellness, Financial Benefits, Paid Time Off, Professional Development, Work-Life Balance, Additional Benefits).
- Each benefit displays as a green checkmark chip.
- "Benefits Vary by Position" renders as a yellow warning note.
- **Requires backend support** — see Section 5.

---

## 3. Application Wizard — Full Candidate Application Flow

**File:** `app/components/ui/ApplicationWizard.tsx` (new component)
**File:** `app/(employee)/browse-jobs/page.tsx`
**File:** `hooks/useApplyForJob.ts`

### 3.1 What Was Built
A full-page, 4-step application wizard opens when a logged-in candidate clicks Apply Now. It matches the employer wizard style exactly:
- `position: fixed; inset: 0` full-screen overlay
- Sticky header with job title, step indicators, and Exit button
- Scrollable content area with white cards
- Fixed footer with Back / Next / Submit navigation

**Steps:**
1. **Resume** — File upload (PDF, DOC, DOCX) with a dropzone UI
2. **Cover Letter** — Toggle between PDF upload and written text
3. **Application Questions** — Renders all screening questions configured by the employer (yes/no, travel %, date, number, text, select, veteran status). If no questions exist, shows a "No screening questions — proceed" message.
4. **Review** — Summary of resume filename, cover letter preview, and all question answers before submitting.

After submission: full-page success screen with job title confirmation.

### 3.2 Question Types Rendered
The wizard supports all question types defined in `QUESTION_CONFIG`:
- `yesno` — Radio buttons (Yes / No)
- `travel` — Yes/No radio + percentage chip selector (10%, 25%, 50%, 75%, 100%) if Yes
- `date` — Date input
- `number` — Number input
- `text` — Text input
- `select` — Dropdown
- `veteran` — Radio group (voluntary, styled with amber color)

### 3.3 API Submission
**File:** `hooks/useApplyForJob.ts`
Always uses `FormData` (multipart) for submission:
```
POST /api/v1/applications
Content-Type: multipart/form-data

Fields:
  jobId         (string)
  resumeFile    (File — PDF, DOC, DOCX)
  coverLetterFile (File — PDF, optional)
  coverLetter   (string — plain text, optional)
  answers       (JSON string of Record<questionId, answer>)
```

### 3.4 Apply Flow Fix — Full Job Fetch Before Opening Wizard
**File:** `app/(employee)/browse-jobs/page.tsx`
When the candidate clicks Apply Now, the page now calls `fetchJobById(id)` before opening the wizard. This is necessary because the job list API response does not include `applicationQuestions` — only the individual job detail endpoint does.

```typescript
async function handleApply() {
  if (!selectedJob) return;
  const jobId = String(selectedJob._id ?? selectedJob.id ?? '');
  if (jobId) {
    const full = await fetchJobById(jobId);
    if (full) { setApplyingToJob(full as Job); return; }
  }
  setApplyingToJob(selectedJob);
}
```

---

## 4. Employer Job Creation Wizard — Benefits Step

**File:** `app/(employer)/employer-dashboard/EmployerDashboardClient.tsx`

### 4.1 New Step Added
A **Benefits & Perks** step (Step 5) was added between the Application Questions step and the Review step. The wizard now has 7 steps:

| Step | Label | Description |
|------|-------|-------------|
| 0 | Basic Info | Role title and type |
| 1 | Location | Where is the role? |
| 2 | Compensation | Salary range |
| 3 | Role Details | Description and skills |
| 4 | Application | Screening questions |
| **5** | **Benefits** | **Perks and benefits (NEW)** |
| 6 | Review | Confirm and publish |

### 4.2 Benefits Categories and Items
The following 6 categories and 43 benefit options are available as checkboxes:

**Health & Wellness**
Medical Insurance, Dental Insurance, Vision Insurance, Prescription Drug Coverage, Health Savings Account (HSA), Flexible Spending Account (FSA), Employee Assistance Program (EAP), Wellness Program

**Financial Benefits**
401(k) Retirement Plan, Employer 401(k) Match, Life Insurance, Short-Term Disability Insurance, Long-Term Disability Insurance, Performance Bonus, Referral Bonus

**Paid Time Off**
Paid Time Off (PTO), Paid Holidays, Sick Leave, Bereavement Leave, Jury Duty Leave, Military Leave, Parental Leave

**Professional Development**
Tuition Reimbursement, Professional Development Assistance, Certification Reimbursement, Continuing Education Support, Conference Attendance

**Work-Life Balance**
Flexible Work Schedule, Hybrid Work Environment, Remote Work Opportunities, Flexible Hours

**Additional Benefits**
Employee Discounts, Commuter Benefits, Parking Provided, Cell Phone Reimbursement, Home Office Stipend, Travel Reimbursement, Company Laptop/Equipment Provided

**Special Option:**
Benefits Vary by Position — for government contractors where benefits differ by contract type, SCA/CBA requirements, or position status (contingent, part-time, temporary).

### 4.3 UI Behavior
- Each group has a "Select all / Deselect all" toggle button
- Benefits render in a 2-column grid within each category
- Selected benefits highlight with a subtle blue background
- The "Benefits Vary by Position" option has its own card with a description

### 4.4 State & Persistence
- `selectedBenefits: string[]` state tracks selections
- Sent to backend via `buildJobPayload()` as `benefits: string[]`
- Restored when editing an existing job via `openDraftForEdit()`
- Cleared on form close/reset

### 4.5 Review Step
The Review step (now Step 6) includes a Benefits section listing all selected benefits.

---

## 5. Backend Requirements

The following backend changes are required to fully support the new frontend features. These items are currently wired up on the frontend but will not persist or display without backend support.

---

### 5.1 Job Schema — Add `benefits` Field

Add a `benefits` field to the Job model:

```javascript
// Mongoose schema
benefits: {
  type: [String],
  default: [],
}
```

---

### 5.2 Job Create Endpoint — Accept `benefits`

**Route:** `POST /api/v1/jobs`
Update the request validation schema and controller to accept and save `benefits`:

```javascript
// Joi / Zod validation
benefits: Joi.array().items(Joi.string()).optional().default([])

// Controller
const { title, description, ..., benefits } = req.body;
const job = await Job.create({ ..., benefits });
```

---

### 5.3 Job Update Endpoint — Accept `benefits`

**Route:** `PUT /api/v1/jobs/:id` (or `PATCH`)
Same as above — allow `benefits` in the update payload:

```javascript
if (benefits !== undefined) job.benefits = benefits;
await job.save();
```

---

### 5.4 Job Detail Endpoint — Return `benefits`

**Route:** `GET /api/v1/jobs/:id` and `GET /api/v1/public/jobs/:id`
Ensure `benefits` is included in the serialized job response. If using `.select()` or a DTO/serializer that explicitly lists fields, add `benefits` to it:

```javascript
// If using .select()
Job.findById(id).select('title description location benefits applicationQuestions ...')

// Or if returning the full document, no change needed
```

---

### 5.5 Job List Endpoint — Return `applicationQuestions` and `benefits`

**Route:** `GET /api/v1/jobs` and `GET /api/v1/public/jobs`
Currently the list response appears to omit `applicationQuestions` and likely `benefits` as well. The frontend now calls `GET /api/v1/public/jobs/:id` (the detail endpoint) before opening the application wizard to work around this, but including these fields in the list response would be ideal for performance:

```javascript
// Include in list projection or serializer
applicationQuestions: 1,
benefits: 1,
```

---

### 5.6 Applications Endpoint — Accept Resume File

**Route:** `POST /api/v1/applications`
The application form now submits `multipart/form-data` with the following fields. Confirm all are handled by the backend:

| Field | Type | Description |
|-------|------|-------------|
| `jobId` | string | ID of the job being applied to |
| `resumeFile` | File (PDF/DOC/DOCX) | Candidate's resume |
| `coverLetterFile` | File (PDF) | Cover letter PDF (optional) |
| `coverLetter` | string | Written cover letter text (optional) |
| `answers` | JSON string | `Record<questionId, answerString>` — screening question answers |

If the backend currently only accepts `coverLetterFile` and `coverLetter` but not `resumeFile` or `answers`, those need to be added to the multer configuration and the application document schema:

```javascript
// Multer config
upload.fields([
  { name: 'resumeFile', maxCount: 1 },
  { name: 'coverLetterFile', maxCount: 1 },
])

// Application schema
resumeUrl: { type: String },     // S3/Cloudinary URL after upload
answers: { type: Map, of: String, default: {} },
```

---

## 6. File Change Summary

| File | Change Type |
|------|-------------|
| `app/styles/index.css` | Added RTE CSS and scrollbar styles |
| `app/components/Navbar.tsx` | Candidate controls, browse-jobs navbar, click-outside dropdown |
| `app/components/Footer.tsx` | Hidden on `/browse-jobs` |
| `app/components/ui/JobCard.tsx` | Removed description, Apply button |
| `app/components/ui/JobDetailDrawer.tsx` | Cleanup, metadata redesign, Apply Now button, Benefits section |
| `app/components/ui/ApplicationWizard.tsx` | New full-page application wizard component |
| `app/(employee)/browse-jobs/page.tsx` | Scrollbar, wizard integration, handleApply fetch fix |
| `app/(employer)/employer-dashboard/EmployerDashboardClient.tsx` | Benefits step (step 5), review section update |
| `hooks/useApplyForJob.ts` | Added `resumeFile`, `answers` to FormData submission |
| `hooks/useGetPublicJobs.tsx` | Added `benefits`, `applicationQuestions` to `PublicJob` type |

---

*End of Report*
