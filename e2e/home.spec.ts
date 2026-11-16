import { expect, test } from '@playwright/test';

test('home loads and shows key content', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { level: 1, name: /cada animal merece/i })).toBeVisible();
  await expect(page.getByText(/plataforma web para la adopción de animales/i)).toBeVisible();
  await expect(page.getByRole('main').getByRole('link', { name: /explorar animales/i })).toBeVisible();
});
