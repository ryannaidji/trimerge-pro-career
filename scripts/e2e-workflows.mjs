#!/usr/bin/env node
// End-to-end smoke test of the main user workflows against the local Docker stack.
// Goes through the web app's function adapter (/.netlify/functions/*), the same path
// the browser uses. Requires: `docker compose up -d` with MAIL_DRIVER=console.
// Usage: node scripts/e2e-workflows.mjs
// Author: Ryan Naidji
import { execSync } from 'node:child_process';

const WEB = process.env.WEB_URL || 'http://localhost:3000';
const API = process.env.API_URL || 'http://localhost:4000';
const run = Date.now();
const results = [];

async function call(name, { method = 'POST', body, token, query = '' } = {}) {
  const res = await fetch(`${WEB}/.netlify/functions/${name}${query}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = text; }
  return { status: res.status, data };
}

async function api(path, { method = 'GET', body, token } = {}) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: res.status, data: await res.json().catch(() => ({})) };
}

async function upload(path, field, bytes, filename, type, token) {
  const form = new FormData();
  form.append(field, new Blob([bytes], { type }), filename);
  const res = await fetch(`${API}${path}`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: form });
  return { status: res.status, data: await res.json().catch(() => ({})) };
}

// Minimal valid files for upload tests
const PDF_BYTES = Buffer.from('%PDF-1.4\n1 0 obj<</Type/Catalog>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF\n');
const PNG_BYTES = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');

function step(name, ok, detail = '') {
  results.push({ name, ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? `  — ${detail}` : ''}`);
}

// Read the latest OTP sent to `email` from the API logs (console email driver)
function readOtp(email) {
  const logs = execSync('docker compose logs api --no-color --tail 400', { encoding: 'utf8' });
  const blocks = logs.split('[email:console]').filter((b) => b.includes(`To: ${email}`));
  const match = blocks.at(-1)?.match(/code is: (\d+)/);
  return match?.[1];
}

async function signUp(role, email, password, name) {
  const reg = await call('register', {
    body: { name, email, password, confirmPassword: password, terms: true, updates: false, role },
  });
  step(`${role}: register`, reg.status === 200 || reg.status === 201, `status ${reg.status}`);
  const otp = readOtp(email);
  step(`${role}: verification code delivered (console driver)`, !!otp);
  const ver = await call('verifyEmail', { body: { email, otp } });
  step(`${role}: verify email`, ver.status === 200, `status ${ver.status}`);
  const login = await call('login', { body: { email, password } });
  const token = login.data?.accessToken || login.data?.data?.accessToken;
  step(`${role}: log in`, login.status === 200 && !!token, `status ${login.status}`);
  return token;
}

const password = 'Str0ng-Passw0rd!';
const candidateEmail = `candidate.${run}@example.test`;
const employerEmail = `employer.${run}@example.test`;

// 1. Employer onboarding
const employerToken = await signUp('Recruiter', employerEmail, password, 'Erin Employer');
let r = await call('recruiterOnboardingStepTwo', {
  token: employerToken,
  body: { companyName: 'Acme Gov Solutions', industry: 'Technology', location: 'Miami, FL', yourRole: 'Recruiter', companySize: '11-50' },
});
step('Recruiter: onboarding step 2 (company)', r.status === 200, `status ${r.status}`);
r = await call('recruiterOnboardingStepThree', {
  token: employerToken,
  body: { companyOverview: 'We deliver IT services to public agencies.', benefitsAndOpportunities: 'Health insurance, training.', primaryHiringNeeds: 'Engineers, Analysts' },
});
step('Recruiter: onboarding step 3 (profile)', r.status === 200, `status ${r.status}`);

// 2. Employer posts a job
r = await call('createJob', {
  token: employerToken,
  body: {
    title: `Cloud Engineer ${run}`, description: 'Design and run cloud infrastructure for public sector clients.',
    requirements: '3+ years AWS or Azure', location: 'Miami, FL', department: 'ENGINEERING',
    employmentType: 'FULL_TIME', salaryMin: 90000, salaryMax: 120000, currency: 'USD', skills: ['AWS', 'Terraform'], status: 'OPEN',
  },
});
const jobId = r.data?.job?.id || r.data?.job?._id || r.data?.data?.id || r.data?.id || r.data?._id;
step('Employer: create job', (r.status === 200 || r.status === 201) && !!jobId, `status ${r.status}`);

// 3. Public job search (no account)
r = await call('getJobsPublic', { method: 'GET', query: `?search=${encodeURIComponent(`Cloud Engineer ${run}`)}` });
const found = JSON.stringify(r.data).includes(String(run));
step('Visitor: job visible in public search', r.status === 200 && found, `status ${r.status}`);

// 4. Candidate onboarding and application
const candidateToken = await signUp('Candidate', candidateEmail, password, 'Casey Candidate');
r = await call('candidateOnboardingStepTwo', {
  token: candidateToken,
  body: { location: 'Tampa, FL', jobTitleOrDesiredRole: 'Cloud Engineer', yearsOfExperience: '5' },
});
step('Candidate: onboarding step 2 (details)', r.status === 200, `status ${r.status}`);
r = await call('candidateOnboardingStepThree', {
  token: candidateToken,
  body: { skills: ['AWS', 'Kubernetes'], professionalSummary: 'Cloud engineer with public sector experience.' },
});
step('Candidate: onboarding step 3 (skills)', r.status === 200, `status ${r.status}`);

r = await call('applyForJob', { token: candidateToken, body: { jobId, coverLetter: 'I would love to join your team.' } });
step('Candidate: apply to job', r.status === 200 || r.status === 201, `status ${r.status}`);
r = await call('applyForJob', { token: candidateToken, body: { jobId, coverLetter: 'Again' } });
step('Candidate: duplicate application rejected', r.status >= 400, `status ${r.status}`);
r = await api('/api/v1/applications/my-applications', { token: candidateToken });
step('Candidate: sees own application', r.status === 200 && JSON.stringify(r.data).includes(jobId), `status ${r.status}`);

// 5. Employer reviews applicants and updates status
r = await call('applicationsForJob', { method: 'GET', token: employerToken, query: `?jobId=${jobId}` });
const appId = JSON.stringify(r.data).match(/"(?:id|_id)":"([a-f0-9]{24})"/)?.[1];
step('Employer: list applicants for job', r.status === 200 && JSON.stringify(r.data).includes(candidateEmail.split('@')[0]) || !!appId, `status ${r.status}`);
const apps = await api(`/api/v1/applications/job/${jobId}`, { token: employerToken });
const applicationId = apps.data?.applications?.[0]?.id || apps.data?.applications?.[0]?._id || apps.data?.data?.[0]?.id;
r = await api(`/api/v1/applications/${applicationId}/status`, { method: 'PATCH', token: employerToken, body: { status: 'SHORTLISTED' } });
step('Employer: shortlist applicant', r.status === 200, `status ${r.status}`);

// 5b. Returning candidate: profile, resume, bookmarks
r = await api('/api/v1/candidates/me', { method: 'PUT', token: candidateToken, body: { headline: 'Cloud Engineer (AWS)', skills: ['AWS', 'Kubernetes', 'Terraform'], location: 'Tampa, FL' } });
step('Candidate: update profile', r.status === 200, `status ${r.status}`);
r = await api('/api/v1/candidates/me', { token: candidateToken });
step('Candidate: profile changes saved', r.status === 200 && JSON.stringify(r.data).includes('Cloud Engineer (AWS)'), `status ${r.status}`);
r = await upload('/api/v1/resumes/upload', 'resume', PDF_BYTES, 'resume.pdf', 'application/pdf', candidateToken);
const resumeUrl = r.data?.resume?.resumeUrl;
step('Candidate: upload resume (PDF)', r.status === 201 && !!resumeUrl, `status ${r.status}`);
if (resumeUrl) {
  // Resumes are private (#59): owner yes, anonymous and unrelated users no
  const auth = (t) => ({ headers: { Authorization: `Bearer ${t}` } });
  let file = await fetch(resumeUrl, auth(candidateToken));
  step('Candidate: download own resume (attachment, nosniff)', file.status === 200 && /attachment/.test(file.headers.get('content-disposition') || '') && file.headers.get('x-content-type-options') === 'nosniff', `status ${file.status}`);
  file = await fetch(resumeUrl);
  step('Security: resume not public (anonymous 401)', file.status === 401, `status ${file.status}`);
  const outsider = await signUp('Recruiter', `outsider.${run}@example.test`, password, 'Other Employer');
  file = await fetch(resumeUrl, auth(outsider));
  step('Security: employer without an application cannot download the resume', file.status === 403, `status ${file.status}`);
  file = await fetch(resumeUrl, auth(employerToken));
  step('Employer who received the application can download the resume', file.status === 200, `status ${file.status}`);
  file = await fetch(resumeUrl.replace('/api/v1/files/', '/uploads/'));
  step('Security: old public /uploads path no longer serves resumes', file.status === 404, `status ${file.status}`);
}
r = await upload('/api/v1/resumes/upload', 'resume', Buffer.from('<script>alert(1)</script>'), 'cv.pdf', 'application/pdf', candidateToken);
step('Security: fake PDF upload rejected', r.status === 400, `status ${r.status}`);
r = await api('/api/v1/bookmarks', { method: 'POST', token: candidateToken, body: { jobId } });
step('Candidate: bookmark a job', r.status === 200 || r.status === 201, `status ${r.status}`);
r = await api('/api/v1/bookmarks/my-bookmarks', { token: candidateToken });
step('Candidate: bookmark listed', r.status === 200 && JSON.stringify(r.data).includes(jobId), `status ${r.status}`);
r = await api(`/api/v1/bookmarks/${jobId}`, { method: 'DELETE', token: candidateToken });
step('Candidate: remove bookmark', r.status === 200 || r.status === 204, `status ${r.status}`);

// 5c. Existing employer: manage postings, company logo, find talent
r = await api(`/api/v1/jobs/${jobId}`, { method: 'PUT', token: employerToken, body: { title: `Senior Cloud Engineer ${run}`, salaryMax: 130000 } });
step('Employer: edit job', r.status === 200, `status ${r.status}`);
r = await api(`/api/v1/jobs/${jobId}`, { token: employerToken });
step('Employer: job changes saved', r.status === 200 && JSON.stringify(r.data).includes(`Senior Cloud Engineer ${run}`), `status ${r.status}`);
r = await api(`/api/v1/jobs/${jobId}`, { method: 'PUT', token: candidateToken, body: { title: 'hijack' } });
step("Security: candidate cannot edit an employer's job", r.status === 403, `status ${r.status}`);
r = await call('createJob', { token: employerToken, body: { title: `Temp job ${run}`, description: 'Temporary posting to test deletion.', department: 'OPERATIONS', employmentType: 'CONTRACT', status: 'DRAFT', skills: [] } });
const tempJobId = r.data?.job?.id || r.data?.job?._id || r.data?.id || r.data?._id;
r = await api(`/api/v1/jobs/${tempJobId}`, { method: 'DELETE', token: employerToken });
step('Employer: delete a job', r.status === 200 || r.status === 204, `status ${r.status}`);
r = await api(`/api/v1/jobs/${tempJobId}`, { token: employerToken });
step('Employer: deleted job is gone', r.status === 404, `status ${r.status}`);
r = await upload('/api/v1/settings/company-logo', 'logo', PNG_BYTES, 'logo.png', 'image/png', employerToken);
step('Employer: upload company logo (PNG)', r.status === 200 || r.status === 201, `status ${r.status}`);
r = await api('/api/v1/candidates/search?skills=Terraform&q=cloud', { token: employerToken });
step('Employer: find candidate by skill (talent search)', r.status === 200 && JSON.stringify(r.data).includes('Casey'), `status ${r.status}`);
step('Privacy: talent search hides email and resume text', !JSON.stringify(r.data).includes('@example.test') && !JSON.stringify(r.data).includes('resumeText'));
r = await api('/api/v1/candidates/search?q=cloud', { token: candidateToken });
step('Security: candidates cannot search other candidates', r.status === 403, `status ${r.status}`);

// 5d. Account management: password reset and change
r = await call('forgotPassword', { body: { email: candidateEmail } });
step('Candidate: request password reset', r.status === 200, `status ${r.status}`);
const resetOtp = readOtp(candidateEmail);
const newPassword = 'N3w-Str0ng-Passw0rd!';
r = await call('resetPassword', { body: { email: candidateEmail, otp: resetOtp, newPassword } });
step('Candidate: reset password with emailed code', r.status === 200, `status ${r.status}`);
r = await call('login', { body: { email: candidateEmail, password } });
step('Security: old password no longer works', r.status >= 400, `status ${r.status}`);
r = await call('login', { body: { email: candidateEmail, password: newPassword } });
const freshToken = r.data?.accessToken;
step('Candidate: log in with new password', r.status === 200 && !!freshToken, `status ${r.status}`);
r = await api('/api/v1/settings/change-password', { method: 'PATCH', token: freshToken, body: { currentPassword: newPassword, newPassword: password } });
step('Candidate: change password from settings', r.status === 200, `status ${r.status}`);

// 5e. Phase 2: recommendations, search opt-out, logout, self-service deletion
r = await api('/api/v1/recommendations/jobs', { token: freshToken });
step('Candidate: recommended jobs endpoint', r.status === 200 && Array.isArray(r.data?.recommendations), `status ${r.status}`);
const recoEmail = `reco.${run}@example.test`;
const recoToken = await signUp('Candidate', recoEmail, password, 'Reco Candidate');
await api('/api/v1/candidates/me', { method: 'PUT', token: recoToken, body: { skills: ['AWS', 'Terraform'], jobTitleOrDesiredRole: 'Cloud Engineer' } });
r = await api('/api/v1/recommendations/jobs', { token: recoToken });
step('Candidate: job matching skills is recommended', JSON.stringify(r.data).includes(`Cloud Engineer ${run}`), `status ${r.status}`);
r = await api('/api/v1/candidates/me', { method: 'PUT', token: recoToken, body: { searchable: false } });
r = await api('/api/v1/candidates/search?skills=Terraform', { token: employerToken });
step('Privacy: opted-out candidate hidden from talent search', r.status === 200 && !JSON.stringify(r.data).includes('Reco'), `status ${r.status}`);

r = await call('login', { body: { email: recoEmail, password } });
const refreshToRevoke = r.data?.refreshToken;
r = await api('/api/v1/auth/logout', { method: 'POST', body: { refreshToken: refreshToRevoke } });
step('Logout revokes the refresh token', r.status === 200, `status ${r.status}`);
r = await api('/api/v1/auth/refresh-token', { method: 'POST', body: { refreshToken: refreshToRevoke } });
step('Security: revoked refresh token is refused', r.status === 401, `status ${r.status}`);

r = await api('/api/v1/account', { method: 'DELETE', token: recoToken, body: { password: 'wrong-password' } });
step('Account deletion requires the correct password', r.status === 401, `status ${r.status}`);
r = await api('/api/v1/account', { method: 'DELETE', token: recoToken, body: { password } });
step('Candidate: delete own account', r.status === 200, `status ${r.status}`);
r = await call('login', { body: { email: recoEmail, password } });
step('Deleted account can no longer log in', r.status >= 400, `status ${r.status}`);

// 6. Access control
r = await api('/api/v1/applications', { method: 'POST', body: { jobId } });
step('Security: anonymous application rejected', r.status === 401, `status ${r.status}`);
r = await api(`/api/v1/applications/job/${jobId}`, { token: candidateToken });
step('Security: candidate cannot list applicants', r.status === 403, `status ${r.status}`);
r = await api('/api/v1/admin/users', { token: employerToken });
step('Security: employer cannot use admin API', r.status === 403, `status ${r.status}`);

// 7. Admin workflow (account created with: docker compose exec api node dist/scripts/create-admin.js)
const adminEmail = process.env.ADMIN_EMAIL || 'admin@trimerge.local';
const adminPassword = process.env.ADMIN_PASSWORD || 'Admin-Local-2026!';
r = await call('login', { body: { email: adminEmail, password: adminPassword } });
const adminToken = r.data?.accessToken;
step('Admin: log in', r.status === 200 && !!adminToken, `status ${r.status}`);
r = await api(`/api/v1/admin/users?search=${encodeURIComponent(`employer.${run}`)}`, { token: adminToken });
const employerUser = r.data?.users?.[0];
step('Admin: find user by search', r.status === 200 && employerUser?.email === employerEmail, `status ${r.status}`);
r = await api(`/api/v1/admin/users/${employerUser?._id}/status`, { method: 'PATCH', token: adminToken, body: { status: 'SUSPENDED' } });
step('Admin: suspend user', r.status === 200, `status ${r.status}`);
r = await call('login', { body: { email: employerEmail, password } });
step('Security: suspended user cannot log in', r.status >= 400, `status ${r.status}`);
r = await api(`/api/v1/admin/users/${employerUser?._id}/status`, { method: 'PATCH', token: adminToken, body: { status: 'ACTIVE' } });
step('Admin: reactivate user', r.status === 200, `status ${r.status}`);
r = await api(`/api/v1/admin/jobs/${jobId}/status`, { method: 'PATCH', token: adminToken, body: { status: 'CLOSED' } });
step('Admin: close a job posting', r.status === 200, `status ${r.status}`);
r = await api('/api/v1/admin/users?search=.*(a+)+$', { token: adminToken });
step('Security: regex in search is treated as text', r.status === 200, `status ${r.status}`);
const page = await fetch(`${WEB}/admin`);
step('Web: admin page served', page.status === 200, `status ${page.status}`);

const failed = results.filter((x) => !x.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);
