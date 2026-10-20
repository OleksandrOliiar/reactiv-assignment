import { defaultConfigurationData } from '@reactiv/contracts';
import { expect, test, type APIRequestContext, type Page } from '@playwright/test';

const apiKey = process.env.API_KEY ?? 'change-me-to-a-long-random-secret';
const apiBase = process.env.CONFIG_SERVICE_URL ?? 'http://localhost:3001';

async function resetConfiguration(request: APIRequestContext) {
  const headers = { 'x-api-key': apiKey, 'content-type': 'application/json' };
  const current = await request.get(`${apiBase}/v1/configurations/default`, { headers });
  if (current.ok()) {
    const body = (await current.json()) as { version: number };
    const updated = await request.put(`${apiBase}/v1/configurations/default`, {
      headers,
      data: { version: body.version, data: defaultConfigurationData },
    });
    expect(updated.ok()).toBeTruthy();
    return;
  }

  const created = await request.post(`${apiBase}/v1/configurations`, {
    headers,
    data: { id: 'default', data: defaultConfigurationData },
  });
  expect(created.ok()).toBeTruthy();
}

async function openTextSection(page: Page) {
  const trigger = page.getByRole('button', { name: '2. Welcome home Text' });
  await trigger.scrollIntoViewIfNeeded();
  await trigger.click();
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  await expect(page.getByRole('textbox', { name: 'Title', exact: true })).toBeVisible();
}

async function setTitle(page: Page, value: string) {
  await openTextSection(page);
  await page.getByRole('textbox', { name: 'Title', exact: true }).fill(value);
}

test.beforeEach(async ({ request }) => {
  await resetConfiguration(request);
});

test.describe('home screen editor', () => {
  test('edits, saves, and reloads the persisted screen', async ({ page }) => {
    const title = `Updated ${Date.now()}`;
    await page.goto('/');

    await setTitle(page, title);
    await page.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(page.getByText('Home screen saved')).toBeVisible();
    await expect(page.getByText('Saved', { exact: true })).toBeVisible();

    await page.reload();
    await expect(
      page.getByRole('button', { name: new RegExp(`^\\d+\\.\\s*${title}`) }),
    ).toBeVisible();
    await expect(page.getByLabel('Phone preview').getByText(title)).toBeVisible();
  });

  test('shows a conflict dialog and can overwrite', async ({ page, browser }) => {
    await page.goto('/');
    const localTitle = `Local ${Date.now()}`;
    await setTitle(page, localTitle);

    const other = await browser.newPage();
    await other.goto('/');
    await setTitle(other, `Remote ${Date.now()}`);
    await other.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(other.getByText('Home screen saved')).toBeVisible();
    await other.close();

    await page.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(page.getByText('This screen was saved somewhere else')).toBeVisible();
    await page.getByRole('button', { name: 'Overwrite' }).click();
    await expect(page.getByText('Home screen saved')).toBeVisible();
    await expect(page.getByText('Saved', { exact: true })).toBeVisible();
    await expect(
      page.getByRole('button', { name: new RegExp(`^2\\.\\s*${localTitle}`) }),
    ).toBeVisible();
  });

  test('rejects a malformed import file', async ({ page }) => {
    await page.goto('/');

    await page.locator('input[type="file"]').setInputFiles({
      name: 'broken.json',
      mimeType: 'application/json',
      buffer: Buffer.from('{'),
    });

    await expect(page.getByText('Could not read this file')).toBeVisible();
    await expect(page.getByText('This file is not valid JSON.')).toBeVisible();
  });

  test('shows edit and preview tabs on a phone viewport', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    const previewTab = page.getByRole('tab', { name: 'Preview' });
    await expect(previewTab).toBeVisible();
    await previewTab.click();
    await expect(previewTab).toHaveAttribute('data-state', 'active');
    await expect(page.getByRole('tabpanel', { name: 'Preview' })).toBeVisible();
    await expect(page.getByLabel('Phone preview')).toBeVisible();
  });

  test('moves a section with the arrow keys on the drag handle', async ({ page }) => {
    await page.goto('/');

    const handle = page.getByRole('button', { name: 'Reorder Welcome home' });
    await handle.scrollIntoViewIfNeeded();
    await handle.press('ArrowUp');

    await expect(page.getByRole('button', { name: /^\d+\.\s/ }).first()).toHaveAccessibleName(
      /Welcome home/,
    );
    await expect(page.getByRole('button', { name: 'Discard' })).toBeEnabled();
  });
});
