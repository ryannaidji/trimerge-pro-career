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
