import { expect, test } from '@playwright/test';

test('serves meaningful HTML at every public URL', async ({ request }) => {
  const pages = ['/', '/about/', '/migration/', '/workspace/', '/workspace/settings/'];

  for (const pathname of pages) {
    const response = await request.get(pathname);
    expect(response.ok(), `${pathname} should be a real static page`).toBe(true);
    const html = await response.text();
    expect(html).toContain('<main');
    expect(html).toContain('<h1');
    expect(html).toContain('aura-router-link');
  }
});

test('upgrades ordinary links without reloading the document', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-router-ready', 'true');

  const bootToken = await page.locator('[data-boot-token]').textContent();
  const documentLoad = await page.locator('[data-document-load]').textContent();

  await page.evaluate(() => window.scrollTo(0, 300));
  await page.getByRole('link', { name: 'How it works' }).first().click();

  await expect(page).toHaveURL(/\/about\/$/);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('The server keeps its job.');
  await expect(page.locator('[data-boot-token]')).toHaveText(bootToken ?? '');
  await expect(page.locator('[data-document-load]')).toHaveText(documentLoad ?? '');
  await expect(page.locator('[data-spa-count]')).toHaveText('1');
});

test('supports browser back and forward through SPA history', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Migration' }).first().click();
  await expect(page).toHaveURL(/\/migration\/$/);

  await page.goBack();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Keep the HTML');

  await page.goForward();
  await expect(page).toHaveURL(/\/migration\/$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Three changes, not a rewrite.');
});

test('keeps a nested layout mounted while swapping child routes', async ({ page }) => {
  await page.goto('/workspace/');
  await expect(page.locator('html')).toHaveAttribute('data-router-ready', 'true');

  const instance = await page.locator('[data-shell-instance]').textContent();
  expect(instance).toMatch(/^[a-f0-9]{6}$/);

  await page.getByRole('link', { name: 'Settings', exact: true }).click();

  await expect(page).toHaveURL(/\/workspace\/settings\/$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Only this leaf changed.');
  await expect(page.locator('[data-shell-instance]')).toHaveText(instance ?? '');
  await expect(page.getByRole('link', { name: 'Settings', exact: true })).toHaveAttribute(
    'aria-current',
    'page',
  );
  await expect(page.getByRole('link', { name: 'Overview', exact: true })).not.toHaveAttribute(
    'aria-current',
    /.+/,
  );
});

test('retains a full-document fallback when JavaScript is disabled', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();

  await page.goto('/');
  await expect(page.locator('.noscript')).toContainText('every link still opens a real HTML page');
  await page.getByRole('link', { name: 'How it works' }).first().click();

  await expect(page).toHaveURL(/\/about\/$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('The server keeps its job.');
  await expect(page.locator('[data-spa-count]')).toHaveText('0');
  await context.close();
});

test('does not mask unknown direct URLs with an SPA fallback', async ({ request }) => {
  const response = await request.get('/this-page-does-not-exist/');
  expect(response.status()).toBe(404);
});
