// Logged-in pages for each role, checked in a real browser with axe accessibility rules (#24, #36).
// Accounts are created through the API; verification codes are read from the API logs
// (console email driver), so this needs the local Docker stack.
// Author: Ryan Naidji
import { execSync } from 'node:child_process';
import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const API = process.env.API_URL || 'http://localhost:4000';
const run = Date.now();
const password = 'Str0ng-Passw0rd!';
const employer = { email: `pw.employer.${run}@example.test`, name: `Pat Employer${run}` };
const candidate = { email: `pw.candidate.${run}@example.test`, name: `Robin Candidate${run}` };
const admin = { email: process.env.ADMIN_EMAIL || 'admin@trimerge.local', password: process.env.ADMIN_PASSWORD || 'Admin-Local-2026!' };
const jobTitle = `Grants Analyst ${run}`;

async function api(path: string, init: { method?: string; body?: unknown; token?: string } = {}) {
  const res = await fetch(`${API}${path}`, {
    method: init.method || 'GET',
    headers: { 'Content-Type': 'application/json', ...(init.token ? { Authorization: `Bearer ${init.token}` } : {}) },
    body: init.body ? JSON.stringify(init.body) : undefined,
  });
  return { status: res.status, data: await res.json().catch(() => ({})) };
}

function readOtp(email: string) {
  const logs = execSync('docker compose logs api --no-color --tail 600', { encoding: 'utf8', cwd: '..' });
  return logs.split('[email:console]').filter((b) => b.includes(`To: ${email}`)).at(-1)?.match(/code is: (\d+)/)?.[1];
}

async function signUp(email: string, fullName: string, role: 'Candidate' | 'Recruiter') {
  await api('/api/v1/onboarding/register', { method: 'POST', body: { fullName, email, password, confirmPassword: password, role, agreeToTerms: true } });
  await api('/api/v1/onboarding/verify-email', { method: 'POST', body: { email, otp: readOtp(email) } });
  return (await api('/api/v1/auth/login', { method: 'POST', body: { email, password } })).data;
}

const sessions: Record<string, { accessToken: string; refreshToken?: string; user: Record<string, unknown> }> = {};

test.beforeAll(async () => {
  const emp = await signUp(employer.email, employer.name, 'Recruiter');
  await api('/api/v1/onboarding/recruiter/step-2', { method: 'POST', token: emp.accessToken, body: { companyName: 'Sunshine Public Services', industry: 'Government', location: 'Orlando, FL', yourRole: 'HR Manager' } });
  await api('/api/v1/onboarding/recruiter/step-3', { method: 'POST', token: emp.accessToken, body: { companyOverview: 'We support county programs.', benefitsAndOpportunities: 'Training and hybrid work.', primaryHiringNeeds: 'Analysts' } });
  const job = await api('/api/v1/jobs', { method: 'POST', token: emp.accessToken, body: { title: jobTitle, description: 'Manage federal and state grant reporting.', department: 'OPERATIONS', employmentType: 'FULL_TIME', status: 'OPEN', skills: ['Grants Management', 'Excel'], location: 'Orlando, FL' } });
  const jobId = job.data?.job?.id || job.data?.job?._id || job.data?.id;

  const cand = await signUp(candidate.email, candidate.name, 'Candidate');
  await api('/api/v1/onboarding/candidate/step-2', { method: 'POST', token: cand.accessToken, body: { location: 'Orlando, FL', jobTitleOrDesiredRole: 'Grants Analyst', yearsOfExperience: '6-8' } });
  await api('/api/v1/onboarding/candidate/step-3', { method: 'POST', token: cand.accessToken, body: { skills: ['Grants Management', 'Excel'], professionalSummary: 'Grants analyst for county programs.' } });
  await api('/api/v1/applications', { method: 'POST', token: cand.accessToken, body: { jobId, coverLetter: 'Interested in this role.' } });

  // Log in again so the stored user reflects the completed onboarding
  sessions.employer = (await api('/api/v1/auth/login', { method: 'POST', body: { email: employer.email, password } })).data;
  sessions.candidate = (await api('/api/v1/auth/login', { method: 'POST', body: { email: candidate.email, password } })).data;
  sessions.admin = (await api('/api/v1/auth/login', { method: 'POST', body: { email: admin.email, password: admin.password } })).data;
});

async function signIn(page: Page, role: string) {
  const s = sessions[role];
  await page.goto('/');
  await page.evaluate((session) => {
    localStorage.setItem('tm_token', session.accessToken);
    if (session.refreshToken) localStorage.setItem('tm_refresh', session.refreshToken);
    localStorage.setItem('tm_user', JSON.stringify(session.user));
  }, s);
}

async function expectAccessible(page: Page) {
  // No horizontal scrolling: on phones it makes the browser zoom out and hides fixed footers (#31)
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow, 'page is wider than the screen').toBeLessThanOrEqual(1);
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  const serious = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
  expect(
    serious.map((v) => `${v.id}: ${v.help} -> ${v.nodes.map((n) => `${n.target.join(' ')} [${(n.any[0]?.message || '').slice(0, 120)}]`).join(' | ')}`)
  ).toEqual([]);
}

test('candidate: applications page lists the application', async ({ page }) => {
  await signIn(page, 'candidate');
  await page.goto('/applications');
  await expect(page.getByText(jobTitle).first()).toBeVisible({ timeout: 20_000 });
  await expectAccessible(page);
});

test('candidate: browse jobs shows the open job', async ({ page }) => {
  await signIn(page, 'candidate');
  await page.goto('/browse-jobs');
  await expect(page.getByText(jobTitle).first()).toBeVisible({ timeout: 20_000 });
  await expectAccessible(page);
});

test('employer: dashboard shows the posting', async ({ page }) => {
  await signIn(page, 'employer');
  await page.goto('/employer-dashboard');
  await expect(page.getByText(jobTitle).first()).toBeVisible({ timeout: 20_000 });
  await expectAccessible(page);
});

test('employer: talent search finds the candidate (#41)', async ({ page }) => {
  await signIn(page, 'employer');
  await page.goto('/talent-search');
  await page.getByLabel('Skills (comma-separated)').fill('Grants Management');
  await page.getByRole('button', { name: 'Search' }).click();
  await expect(page.getByRole('heading', { name: candidate.name, exact: true })).toBeVisible({ timeout: 20_000 });
  await expectAccessible(page);
});

test('admin: dashboard lists users and jobs', async ({ page }) => {
  await signIn(page, 'admin');
  await page.goto('/admin');
  await page.getByLabel('Search users').fill(`pw.employer.${run}`);
  await page.getByRole('button', { name: 'Search' }).click();
  await expect(page.getByRole('cell', { name: employer.email, exact: true })).toBeVisible({ timeout: 20_000 });
  await expectAccessible(page);
  await page.getByRole('tab', { name: 'Jobs' }).click();
  await expect(page.getByRole('cell', { name: jobTitle, exact: true })).toBeVisible({ timeout: 20_000 });
});

test('candidate: onboarding pages are accessible', async ({ page }) => {
  await signIn(page, 'candidate');
  for (const path of ['/personal-information/step-one', '/personal-information/step-two']) {
    await page.goto(path);
    await expect(page.locator('h1').first()).toBeVisible();
    await expectAccessible(page);
  }
});

test('employer: onboarding pages are accessible', async ({ page }) => {
  await signIn(page, 'employer');
  for (const path of ['/recruiter-information/step-one', '/recruiter-information/step-two']) {
    await page.goto(path);
    await expect(page.locator('h1').first()).toBeVisible();
    await expectAccessible(page);
  }
});

test('employer: job description assistant drafts and flags wording (#40)', async ({ page }) => {
  await signIn(page, 'employer');
  await page.goto('/employer-dashboard');
  await page.getByRole('button', { name: 'Post a Job' }).click();
  await page.getByPlaceholder('e.g. Senior Software Engineer').fill('Cybersecurity Analyst');
  for (let i = 0; i < 3; i++) await page.getByRole('button', { name: 'Next →' }).click();
  await page.getByRole('button', { name: 'Draft from job title' }).click();
  await expect(page.getByText('Assess systems against NIST and agency security controls')).toBeVisible();
  // Typing biased wording shows the inclusive-language warning
  const summary = page.locator('[contenteditable="true"]').first();
  await summary.click();
  await summary.press('End');
  await summary.pressSequentially(' Looking for a young rockstar.');
  await expect(page.getByText('Inclusive language check')).toBeVisible();
});

test('employer: job location uses local data and a free-text city (#43)', async ({ page }) => {
  const external: string[] = [];
  page.on('request', (r) => { if (r.url().includes('countriesnow')) external.push(r.url()); });
  await signIn(page, 'employer');
  await page.goto('/employer-dashboard');
  await page.getByRole('button', { name: 'Post a Job' }).click();
  await page.getByPlaceholder('e.g. Senior Software Engineer').fill('Grants Coordinator');
  for (let i = 0; i < 4 && !(await page.getByText('Where is the role located?').isVisible()); i++) {
    await page.getByRole('button', { name: 'Next →' }).click();
  }
  await expect(page.getByText('Where is the role located?')).toBeVisible();
  await page.locator('select').filter({ hasText: 'United States' }).first().selectOption('United States');
  await page.locator('select').filter({ hasText: 'Florida' }).first().selectOption('Florida');
  await page.getByRole('textbox', { name: 'City' }).fill('Tallahassee');
  await expect(page.getByRole('textbox', { name: 'City' })).toHaveValue('Tallahassee');
  expect(external).toEqual([]);
});
