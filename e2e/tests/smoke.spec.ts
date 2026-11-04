import { expect, test } from '@playwright/test';

// Public pages render with their own title and a single h1 (#13, #44)
const PUBLIC_PAGES: [string, RegExp][] = [
  ['/', /TriMergePRO Careers/],
  ['/about', /^About \| TriMergePRO Careers$/],
  ['/browse-jobs', /^Browse Jobs \| TriMergePRO Careers$/],
  ['/employers', /^For Employers \| TriMergePRO Careers$/],
  ['/login', /^Log In \| TriMergePRO Careers$/],
  ['/join-now', /^Join Now \| TriMergePRO Careers$/],
  ['/privacy-policy', /^Privacy Policy \| TriMergePRO Careers$/],
  ['/terms-of-use', /^Terms of Use \| TriMergePRO Careers$/],
  ['/accessibility-statement', /^Accessibility Statement \| TriMergePRO Careers$/],
  ['/eeo-statement', /^Equal Employment Opportunity Statement \| TriMergePRO Careers$/],
];

for (const [path, title] of PUBLIC_PAGES) {
  test(`page ${path} renders`, async ({ page }) => {
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page).toHaveTitle(title);
    await expect(page.locator('h1')).toHaveCount(1);
    // No horizontal scrolling (#31)
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  });
}

test('security headers are sent (#18)', async ({ request }) => {
  const res = await request.get('/');
  const h = res.headers();
  expect(h['content-security-policy']).toContain("frame-ancestors 'none'");
  expect(h['x-frame-options']).toBe('DENY');
  expect(h['x-content-type-options']).toBe('nosniff');
  expect(h['x-powered-by']).toBeUndefined();
});

test('robots.txt and sitemap.xml are served (#12)', async ({ request }) => {
  const robots = await (await request.get('/robots.txt')).text();
  expect(robots).toContain('Disallow: /admin');
  const sitemap = await (await request.get('/sitemap.xml')).text();
  expect(sitemap).toContain('/eeo-statement');
  expect(sitemap).not.toContain('/employer-dashboard');
});

test('login shows an accessible error for wrong credentials', async ({ page }) => {
  await page.goto('/login');
  await page.locator('input[name="email"]').fill('nobody@example.test');
  await page.locator('input[name="password"]').fill('wrong-password-123');
  await page.locator('form button[type="submit"]').click();
  // Next.js also renders an empty route announcer with role="alert"; match the message itself
  await expect(page.getByRole('alert').filter({ hasText: 'Invalid credentials' })).toBeVisible();
});

test('admin page sends anonymous visitors to login (#9)', async ({ page }) => {
  await page.goto('/admin');
  await expect(page).toHaveURL(/\/login$/);
});

test('help assistant answers from the FAQ (#35)', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Ask TriMerge', exact: true }).click();
  await page.getByLabel('Ask a question').fill('I forgot my password');
  await page.getByLabel('Ask a question').press('Enter');
  await expect(page.getByRole('log')).toContainText('reset code');
});

test('keyboard focus is visible (#24)', async ({ page }) => {
  await page.goto('/login');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  const outline = await page.evaluate(() => getComputedStyle(document.activeElement as Element).outlineStyle);
  expect(outline).not.toBe('none');
});
