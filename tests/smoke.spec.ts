import { test, expect } from '@playwright/test';

test.describe('App Smoke Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Intercept OpenRouter models call
    await page.route('https://openrouter.ai/api/v1/models', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [
            { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini' }
          ]
        })
      });
    });

    await page.goto('/');
  });

  test('Smoke 1: App loads and dashboard visible', async ({ page }) => {
    await expect(page.getByText('SpecGen Architect')).toBeVisible();
    await expect(page.getByText('Strategic Blueprint Tool')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Initiate Project' })).toBeVisible();
  });

  test('Smoke 2: Navigation visible', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Projects' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'AI Agents' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Settings' })).toBeVisible();
  });

  test('Smoke 3: Create project and verify it appears', async ({ page }) => {
    await page.getByRole('button', { name: 'Initiate Project' }).click();
    // Assuming a modal or immediate dashboard update
    // For now based on my implementation, addProject() is called which creates a project
    await expect(page.getByText('New Spec Project')).toBeVisible();
  });

  test('Smoke 4: LLM settings UI visible', async ({ page }) => {
    await page.getByRole('button', { name: 'Settings' }).click();
    await expect(page.getByText('Security Protocol')).toBeVisible();
    await expect(page.getByPlaceholder('sk-or-v1-...')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Lock Protocol' })).toBeVisible();
  });

  test('Smoke 5: Project workspace output UI', async ({ page }) => {
    await page.getByRole('button', { name: 'Initiate Project' }).click();
    await page.getByText('New Spec Project').first().click();
    
    await expect(page.getByPlaceholder('Describe your app concept...')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Generate Technical Spec' })).toBeVisible();
    
    // Check tabs
    await expect(page.getByRole('button', { name: 'Parameters' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Structure' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Spec' })).toBeVisible();
  });
});
