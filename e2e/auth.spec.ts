import { expect, test } from '@playwright/test';

test('login page works with show/hide password', async ({ page }) => {
  await page.goto('/login');

  await expect(page.getByText('Bienvenido de nuevo')).toBeVisible();

  const passwordInput = page.locator('#password');
  await expect(passwordInput).toHaveAttribute('type', 'password');

  await page.getByLabel('Mostrar contraseña').click();
  await expect(passwordInput).toHaveAttribute('type', 'text');

  await page.getByRole('link', { name: /crear una cuenta/i }).click();
  await expect(page).toHaveURL(/\/register$/);
});

test('register page supports account type switching', async ({ page }) => {
  await page.goto('/register');

  await expect(page.getByText('Crear una cuenta')).toBeVisible();
  await expect(page.getByRole('button', { name: /crear cuenta como ciudadano/i })).toBeVisible();

  await page.getByRole('button', { name: /fundación/i }).click();
  await expect(page.getByRole('button', { name: /registrar fundación/i })).toBeVisible();
  await expect(page.locator('label', { hasText: /^Municipio$/ })).toBeVisible();

  await page.getByRole('button', { name: /developer/i }).click();
  await expect(page.getByRole('button', { name: /crear cuenta de desarrollador/i })).toBeVisible();
});
