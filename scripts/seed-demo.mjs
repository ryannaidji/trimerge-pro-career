#!/usr/bin/env node
// Create demo accounts and data on the LOCAL stack for manual testing and demos.
// Usage: node scripts/seed-demo.mjs   (stack running, MAIL_DRIVER=console)
// Safe to re-run: existing accounts are reused.
// Author: Ryan Naidji
import { execSync } from 'node:child_process';

const API = process.env.API_URL || 'http://localhost:4000';
const PASSWORD = 'Demo-Passw0rd-2026!';

async function api(path, { method = 'GET', body, token } = {}) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: res.status, data: await res.json().catch(() => ({})) };
}

function readOtp(email) {
  const logs = execSync('docker compose logs api --no-color --tail 500', { encoding: 'utf8' });
  return logs.split('[email:console]').filter((b) => b.includes(`To: ${email}`)).at(-1)?.match(/code is: (\d+)/)?.[1];
}

async function account(email, fullName, role) {
  let login = await api('/api/v1/auth/login', { method: 'POST', body: { email, password: PASSWORD } });
  if (login.status === 200) return { token: login.data.accessToken, created: false };
  await api('/api/v1/onboarding/register', { method: 'POST', body: { fullName, email, password: PASSWORD, confirmPassword: PASSWORD, role, agreeToTerms: true } });
  await api('/api/v1/onboarding/verify-email', { method: 'POST', body: { email, otp: readOtp(email) } });
  login = await api('/api/v1/auth/login', { method: 'POST', body: { email, password: PASSWORD } });
  if (login.status !== 200) throw new Error(`Could not create ${email}: ${JSON.stringify(login.data)}`);
  return { token: login.data.accessToken, created: true };
}

const employer = await account('demo.employer@trimerge.local', 'Dana Recruiter', 'Recruiter');
if (employer.created) {
  await api('/api/v1/onboarding/recruiter/step-2', { method: 'POST', token: employer.token, body: { companyName: 'Sunshine Public Services', industry: 'Government', location: 'Miami, FL', yourRole: 'HR Manager' } });
  await api('/api/v1/onboarding/recruiter/step-3', { method: 'POST', token: employer.token, body: { companyOverview: 'We deliver IT and program services to Florida agencies.', benefitsAndOpportunities: 'Health insurance, training budget, hybrid work.', primaryHiringNeeds: 'Engineers, Analysts' } });
  const jobs = [
    { title: 'Cybersecurity Analyst', department: 'TECHNOLOGY', skills: ['NIST', 'SIEM', 'Security+'], location: 'Tallahassee, FL', description: 'Monitor and protect state agency systems against cyber threats.' },
    { title: 'Grants Analyst', department: 'FINANCE', skills: ['Grants Management', 'Excel', 'GASB'], location: 'Miami, FL', description: 'Manage federal and state grant reporting for county programs.' },
    { title: 'Emergency Management Specialist', department: 'EMERGENCY_MANAGEMENT', skills: ['FEMA', 'ICS', 'NIMS'], location: 'Orlando, FL', description: 'Plan and coordinate preparedness exercises and response operations.' },
  ];
  for (const j of jobs) await api('/api/v1/jobs', { method: 'POST', token: employer.token, body: { ...j, employmentType: 'FULL_TIME', status: 'OPEN', salaryMin: 70000, salaryMax: 95000, currency: 'USD' } });
}

const candidate = await account('demo.candidate@trimerge.local', 'Casey Candidate', 'Candidate');
if (candidate.created) {
  await api('/api/v1/onboarding/candidate/step-2', { method: 'POST', token: candidate.token, body: { location: 'Miami, FL', jobTitleOrDesiredRole: 'Cybersecurity Analyst', yearsOfExperience: '3-5', phoneNumber: '+13055550142' } });
  await api('/api/v1/onboarding/candidate/step-3', { method: 'POST', token: candidate.token, body: { skills: ['NIST', 'SIEM', 'Python'], professionalSummary: 'Security analyst with public-sector experience in incident response and NIST controls.' } });
}

console.log(`
Demo accounts (password for both: ${PASSWORD})
  Candidate: demo.candidate@trimerge.local
  Employer:  demo.employer@trimerge.local
  Admin:     admin@trimerge.local / Admin-Local-2026!
Open http://localhost:3000/login
`);
