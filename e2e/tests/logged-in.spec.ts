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
const cityJob = `Emergency Planner ${run}`;
const closeJob = `Closing Soon ${run}`;

async function api(path: string, init: { method?: string; body?: unknown; token?: string } = {}, attempt = 1): Promise<{ status: number; data: any }> {
  // Retry once on a network error (Docker on Windows occasionally drops a connection)
  const res = await fetch(`${API}${path}`, {
    method: init.method || 'GET',
    headers: { 'Content-Type': 'application/json', ...(init.token ? { Authorization: `Bearer ${init.token}` } : {}) },
    body: init.body ? JSON.stringify(init.body) : undefined,
  }).catch((err) => {
    if (attempt < 2) return null;
    throw err;
  });
  if (!res) return api(path, init, attempt + 1);
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
  await api('/api/v1/jobs', { method: 'POST', token: emp.accessToken, body: { title: cityJob, description: 'Coordinate emergency planning.', department: 'EMERGENCY_MANAGEMENT', employmentType: 'CONTRACT', status: 'OPEN', skills: ['FEMA'], location: 'Tallahassee, Florida, United States' } });
  await api('/api/v1/jobs', { method: 'POST', token: emp.accessToken, body: { title: closeJob, description: 'A posting to close.', department: 'OPERATIONS', employmentType: 'FULL_TIME', status: 'OPEN', skills: ['Excel'], location: 'Miami, Florida, United States' } });

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

test('admin: account menu has admin links only', async ({ page }) => {
  await signIn(page, 'admin');
  await page.goto('/admin');
  const menuButton = page.getByRole('button', { name: /My account/ });
  // Wide screens show the account button; narrow ones put the links in the toggle menu
  if (await page.getByRole('button', { name: 'Toggle navigation' }).isVisible()) {
    await page.getByRole('button', { name: 'Toggle navigation' }).click();
  } else {
    await menuButton.click();
  }
  await expect(page.getByRole('link', { name: 'Admin dashboard', exact: true }).first()).toBeVisible();
  await expect(page.getByRole('link', { name: 'Settings', exact: true }).first()).toBeVisible();
  for (const label of ['My applications', 'Recommended jobs', 'Saved jobs', 'My profile']) {
    await expect(page.getByRole('link', { name: label, exact: true })).toHaveCount(0);
  }
});

test('admin: candidate pages redirect to the dashboard', async ({ page }) => {
  await signIn(page, 'admin');
  for (const path of ['/applications', '/recommended-jobs', '/saved-jobs', '/profile']) {
    await page.goto(path);
    await expect(page).toHaveURL(/\/admin$/, { timeout: 20_000 });
  }
});

test('admin: settings has no delete-account form', async ({ page }) => {
  await signIn(page, 'admin');
  await page.goto('/settings');
  await expect(page.getByRole('heading', { name: 'Change password' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Delete account' })).toHaveCount(0);
});

// Page access by account type (#73, #75-#80): [role, pages opened, where they must land]
const accessRules: [string, string[], RegExp][] = [
  ['candidate', ['/employer-dashboard', '/talent-search', '/recruiter-information/step-one', '/login', '/join-now'], /\/browse-jobs$/],
  ['employer', ['/applications', '/saved-jobs', '/recommended-jobs', '/profile', '/personal-information/step-one', '/login'], /\/employer-dashboard$/],
  ['admin', ['/employer-dashboard', '/personal-information/step-one', '/recruiter-information/step-one', '/join-now'], /\/admin$/],
  ['visitor', ['/settings', '/applications', '/saved-jobs', '/recommended-jobs', '/profile', '/employer-dashboard', '/talent-search', '/personal-information/step-one', '/recruiter-information/step-one'], /\/login$/],
];

for (const [role, paths, landing] of accessRules) {
  test(`${role}: pages for other users redirect home`, async ({ page }) => {
    test.setTimeout(120_000);
    if (role !== 'visitor') await signIn(page, role);
    for (const path of paths) {
      await page.goto(path);
      await expect(page, `opening ${path}`).toHaveURL(landing, { timeout: 20_000 });
    }
  });
}

test('employer: login form still lands on the dashboard (#80)', async ({ page }) => {
  await page.goto('/login');
  await page.locator('input[type="email"]').fill(employer.email);
  await page.locator('input[type="password"]').fill(password);
  await page.locator('form button[type="submit"]').click();
  await expect(page).toHaveURL(/\/employer-dashboard$/, { timeout: 20_000 });
});

test('new candidate: email verification continues into onboarding (#78)', async ({ page }) => {
  const email = `pw.signup.${Date.now()}.${test.info().project.name}@example.test`;
  await api('/api/v1/onboarding/register', { method: 'POST', body: { fullName: 'Sam Newcomer', email, password, confirmPassword: password, role: 'Candidate', agreeToTerms: true } });
  await page.goto(`/email-sent?email=${encodeURIComponent(email)}&role=Candidate`);
  const otp = readOtp(email)!;
  const boxes = page.locator('input');
  for (let i = 0; i < otp.length; i++) await boxes.nth(i).fill(otp[i]);
  await page.locator('main button, form button').filter({ hasText: /verify|continue|confirm/i }).first().click();
  await expect(page).toHaveURL(/\/email-verified/, { timeout: 20_000 });
  await page.goto('/personal-information/step-one');
  await expect(page).toHaveURL(/\/personal-information\/step-one$/);
  await expect(page.locator('h1').first()).toBeVisible();
});

test('employer: help assistant starts in Employer mode (#81)', async ({ page }) => {
  await signIn(page, 'employer');
  await page.goto('/about');
  await page.waitForLoadState('networkidle');
  await page.getByRole('button', { name: /Ask TriMerge/ }).last().click();
  await expect(page.getByRole('button', { name: 'Post jobs' })).toBeVisible();
});

test('navbar on Browse Jobs keeps employer and visitor navigation (#74)', async ({ page }) => {
  await page.goto('/browse-jobs');
  await expect(page.getByRole('link', { name: 'Sign up' })).toBeVisible();
  await signIn(page, 'employer');
  await page.goto('/browse-jobs');
  await expect(page.getByRole('button', { name: 'Logout' })).toBeVisible();
});

// ---------------- Walkthrough fixes (#87-#95) ----------------

const publicJobs = async (search: string) => (await api(`/api/v1/public/jobs?page=1&limit=5&search=${encodeURIComponent(search)}`)).data.jobs as { title: string; location: string }[];

test('visitor: employer sign-up from the recruiter link (#87)', async ({ page }) => {
  const email = `pw.newemployer.${Date.now()}.${test.info().project.name}@example.test`;
  await page.goto('/join-now?role=recruiter');
  await expect(page.getByRole('radio', { name: 'Hiring (employer)' })).toBeChecked();
  await page.getByPlaceholder('Full name *').fill('Nia Employer');
  await page.getByPlaceholder('Email *').fill(email);
  await page.getByPlaceholder('Password *', { exact: true }).fill(password);
  await page.getByPlaceholder('Confirm password *').fill(password);
  await page.locator('#terms').check();
  const [request] = await Promise.all([page.waitForRequest((r) => r.url().includes('/onboarding/register')), page.getByRole('button', { name: 'Create account' }).click()]);
  expect(JSON.parse(request.postData() || '{}').role).toBe('Recruiter');
  await expect(page).toHaveURL(/email-sent.*role=Recruiter/, { timeout: 20_000 });
});

test('visitor: sign-up form explains the 12-character password rule (#91)', async ({ page }) => {
  await page.goto('/join-now');
  await page.getByPlaceholder('Full name *').fill('Short Password');
  await page.getByPlaceholder('Email *').fill('short.password@example.test');
  await page.getByPlaceholder('Password *', { exact: true }).fill('Abcd1234!xy');
  await page.getByPlaceholder('Confirm password *').fill('Abcd1234!xy');
  await page.locator('#terms').check();
  await page.getByRole('button', { name: 'Create account' }).click();
  await expect(page.getByRole('alert').filter({ hasText: 'at least 12 characters' })).toBeVisible();
});

test('new candidate: unfinished onboarding returns to onboarding and blocks applying (#93)', async ({ page }) => {
  const email = `pw.unfinished.${Date.now()}.${test.info().project.name}@example.test`;
  const session = await signUp(email, 'Una Finished', 'Candidate');
  const job = (await api(`/api/v1/public/jobs?page=1&limit=1&search=${encodeURIComponent(jobTitle)}`)).data.jobs[0];
  const refused = await api('/api/v1/applications', { method: 'POST', token: session.accessToken, body: { jobId: job._id } });
  expect(refused.status).toBe(403);
  expect(refused.data.message).toContain('Complete your profile');
  await page.goto('/login');
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill(password);
  await page.locator('form button[type="submit"]').click();
  await expect(page).toHaveURL(/\/personal-information\/step-one$/, { timeout: 20_000 });
});

test('employer: editing a job keeps the city (#89)', async ({ page }) => {
  await signIn(page, 'employer');
  await page.goto('/employer-dashboard');
  const row = page.locator('div').filter({ hasText: cityJob }).filter({ has: page.getByTitle('Edit job') }).last();
  await row.getByTitle('Edit job').click();
  for (let i = 0; i < 8 && await page.getByRole('button', { name: 'Next →' }).isVisible(); i++) {
    await page.getByRole('button', { name: 'Next →' }).click();
    await page.waitForTimeout(300);
  }
  await page.getByRole('button', { name: /Save Changes/ }).click();
  await expect(page.getByRole('button', { name: 'Post a Job' })).toBeVisible({ timeout: 20_000 });
  await expect.poll(async () => (await publicJobs(cityJob))[0]?.location).toBe('Tallahassee, Florida, United States');
});

test('employer: close and reopen a job (#90)', async ({ page }) => {
  await signIn(page, 'employer');
  await page.goto('/employer-dashboard');
  const row = page.locator('div').filter({ hasText: closeJob }).filter({ has: page.getByTitle('Edit job') }).last();
  await row.getByRole('button', { name: 'Close job' }).click();
  await expect(row.getByRole('button', { name: 'Reopen job' })).toBeVisible({ timeout: 20_000 });
  await expect.poll(async () => (await publicJobs(closeJob)).length).toBe(0);
  // A closed job is also hidden from signed-in candidates
  await signIn(page, 'candidate');
  await page.goto('/browse-jobs');
  await page.getByPlaceholder('Job title, keywords, or company').fill(closeJob);
  await expect(page.getByText('No jobs match your search')).toBeVisible({ timeout: 20_000 });
  await signIn(page, 'employer');
  await page.goto('/employer-dashboard');
  await row.getByRole('button', { name: 'Reopen job' }).click();
  await expect(row.getByRole('button', { name: 'Close job' })).toBeVisible({ timeout: 20_000 });
  await expect.poll(async () => (await publicJobs(closeJob)).length).toBe(1);
});

test('candidate: an applied job shows Applied instead of Apply Now (#94)', async ({ page }) => {
  await signIn(page, 'candidate');
  await page.goto('/browse-jobs');
  await page.getByPlaceholder('Job title, keywords, or company').fill(jobTitle);
  await page.getByText(jobTitle).first().click();
  await expect(page.getByText('Applied', { exact: true })).toBeVisible({ timeout: 20_000 });
  await expect(page.getByRole('button', { name: 'Apply Now' })).toHaveCount(0);
});

test('visitor: filter jobs by sector and employment type (#95)', async ({ page }) => {
  await page.goto('/browse-jobs');
  await page.getByPlaceholder('Job title, keywords, or company').fill(String(run));
  await expect(page.getByText(cityJob).first()).toBeVisible({ timeout: 20_000 });
  await page.getByLabel('Filter jobs by sector').selectOption('EMERGENCY_MANAGEMENT');
  await expect(page.getByText(jobTitle)).toHaveCount(0, { timeout: 20_000 });
  await expect(page.getByText(cityJob).first()).toBeVisible();
  await page.getByLabel('Filter jobs by employment type').selectOption('FULL_TIME');
  await expect(page.getByText('No jobs match your search')).toBeVisible({ timeout: 20_000 });
  await expectAccessible(page);
});

test('visitor: load more reaches every job (#92)', async ({ page }) => {
  const total = (await api('/api/v1/public/jobs?page=1&limit=1')).data.pagination.total as number;
  test.skip(total <= 50, 'needs more than 50 open jobs');
  await page.goto('/browse-jobs');
  await expect(page.getByText(`${total} jobs found`)).toBeVisible({ timeout: 20_000 });
  await page.getByRole('button', { name: 'Load more jobs' }).click();
  await expect(page.getByRole('button', { name: 'Load more jobs' })).toHaveCount(0, { timeout: 20_000 });
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

// ---------------- Phase 2 (M7 / M8) ----------------

test('candidate: account menu reaches every candidate page (#49)', async ({ page }) => {
  test.setTimeout(180_000); // five pages, each with an axe scan
  await signIn(page, 'candidate');
  await page.goto('/applications');
  const menuButton = page.getByRole('button', { name: /My account/ });
  for (const [label, path] of [['My profile', '/profile'], ['Saved jobs', '/saved-jobs'], ['Recommended jobs', '/recommended-jobs'], ['Settings', '/settings'], ['My applications', '/applications']] as const) {
    if (await menuButton.isVisible()) {
      await menuButton.click();
      await page.getByRole('link', { name: label, exact: true }).first().click();
    } else {
      await page.getByRole('button', { name: 'Toggle navigation' }).click();
      await page.getByRole('link', { name: label, exact: true }).first().click();
    }
    await expect(page).toHaveURL(new RegExp(`${path}$`));
    await expect(page.locator('h1').first()).toBeVisible();
    await expectAccessible(page);
  }
});

test('candidate: edit profile and hide from talent search (#50, #60)', async ({ page }) => {
  await signIn(page, 'candidate');
  await page.goto('/profile');
  await page.getByLabel('Desired role').fill('Senior Grants Analyst');
  await page.getByLabel('Skills (comma-separated)').fill('Grants Management, Excel, GASB');
  await page.getByLabel(/Visible to employers/).uncheck();
  await page.getByRole('button', { name: 'Save profile' }).click();
  await expect(page.getByText('Your profile has been saved.')).toBeVisible();
  await page.reload();
  await expect(page.getByLabel('Desired role')).toHaveValue('Senior Grants Analyst');
  await expect(page.getByLabel(/Visible to employers/)).not.toBeChecked();
  await expectAccessible(page);
  // restore visibility for the talent-search test
  await page.getByLabel(/Visible to employers/).check();
  await page.getByRole('button', { name: 'Save profile' }).click();
  await expect(page.getByText('Your profile has been saved.')).toBeVisible();
});

test('candidate: save a job and find it in Saved jobs (#51)', async ({ page }) => {
  await signIn(page, 'candidate');
  await page.goto('/browse-jobs');
  await page.getByText(jobTitle).first().click();
  await page.getByRole('button', { name: 'Save job' }).click();
  await expect(page.getByRole('button', { name: 'Saved' })).toHaveAttribute('aria-pressed', 'true');
  await page.goto('/saved-jobs');
  await expect(page.getByRole('heading', { name: jobTitle })).toBeVisible();
  await expectAccessible(page);
});

test('candidate: recommended jobs page loads (#52)', async ({ page }) => {
  await signIn(page, 'candidate');
  await page.goto('/recommended-jobs');
  await expect(page.getByRole('heading', { level: 1, name: 'Recommended jobs' })).toBeVisible();
  await expect(page.getByText('Finding jobs for you…')).toBeHidden({ timeout: 20_000 });
  await expectAccessible(page);
});

test('candidate: change password from Settings (#57)', async ({ page }) => {
  await signIn(page, 'candidate');
  await page.goto('/settings');
  const fill = async (from: string, to: string) => {
    await page.getByLabel('Current password').fill(from);
    await page.getByLabel(/^New password/).fill(to);
    await page.getByLabel('Confirm new password').fill(to);
    await page.getByRole('button', { name: 'Change password' }).click();
    await expect(page.getByText('Your password has been changed.')).toBeVisible();
  };
  await fill(password, 'Temp-Passw0rd-123!');
  await fill('Temp-Passw0rd-123!', password);
  // The page signed this device back in: the stored refresh token must still work
  const refreshed = await page.evaluate(async (api) => {
    const r = await fetch(`${api}/api/v1/auth/refresh-token`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ refreshToken: localStorage.getItem('tm_refresh') }) });
    return r.status;
  }, API);
  expect(refreshed).toBe(200);
  await expectAccessible(page);
});

test('session: an expired access token is refreshed automatically (#55)', async ({ page }) => {
  // Fresh login: other tests change the password, which revokes older refresh tokens
  sessions.candidate = (await api('/api/v1/auth/login', { method: 'POST', body: { email: candidate.email, password } })).data;
  await signIn(page, 'candidate');
  // Simulate an expired/invalid access token; the refresh token is still valid
  await page.evaluate(() => localStorage.setItem('tm_token', 'expired.invalid.token'));
  await page.goto('/profile');
  await expect(page.getByLabel('Desired role')).toBeVisible({ timeout: 20_000 });
  const token = await page.evaluate(() => localStorage.getItem('tm_token'));
  expect(token).not.toBe('expired.invalid.token');
});

test('employer: review an applicant and shortlist them (#47, #48)', async ({ page }) => {
  await signIn(page, 'employer');
  await page.goto('/employer-dashboard');
  await expect(page.getByText('Applications', { exact: true }).first()).toBeVisible(); // overview (#54)
  await page.getByRole('button', { name: 'Candidates' }).first().click();
  await page.getByRole('button', { name: new RegExp(jobTitle) }).first().click();
  await expect(page.getByRole('heading', { level: 2, name: candidate.name })).toBeVisible({ timeout: 20_000 });
  await expect(page.getByText('Interested in this role.')).toBeVisible();
  await page.getByLabel('Application status').selectOption('SHORTLISTED');
  await expect(page.getByText(/is now "Shortlisted"/)).toBeVisible();
  await expectAccessible(page);
});

test('employer: upload a company logo (#53)', async ({ page }) => {
  await signIn(page, 'employer');
  await page.goto('/employer-dashboard');
  await page.getByRole('button', { name: 'Company' }).first().click();
  const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');
  await page.getByLabel(/Upload a logo|Replace logo/).setInputFiles({ name: 'logo.png', mimeType: 'image/png', buffer: png });
  await expect(page.getByText('Logo updated.', { exact: false })).toBeVisible();
  await expectAccessible(page);
});

test('employer: departments match TriMerge sectors (#62)', async ({ page }) => {
  await signIn(page, 'employer');
  await page.goto('/employer-dashboard');
  await page.getByRole('button', { name: 'Post a Job' }).click();
  const department = page.locator('select').filter({ hasText: 'Government & Public Sector' }).first();
  await expect(department).toBeVisible();
  await department.selectOption('EMERGENCY_MANAGEMENT');
  await expect(department.locator('option', { hasText: 'Marketing' })).toHaveCount(0);
});

test('candidate: resume picker in the application form is keyboard accessible (#24, #63)', async ({ page }) => {
  await signIn(page, 'candidate');
  await page.goto('/browse-jobs');
  await page.getByPlaceholder('Job title, keywords, or company').fill(cityJob);
  await page.getByText(cityJob).first().click();
  await page.getByRole('button', { name: 'Apply Now' }).click();
  await expect(page.getByRole('button', { name: /Resume: choose a file/ })).toBeVisible({ timeout: 15_000 });
  const chooser = page.waitForEvent('filechooser');
  await page.getByRole('button', { name: /Resume: choose a file/ }).focus();
  await page.keyboard.press('Enter');
  await chooser;
});
