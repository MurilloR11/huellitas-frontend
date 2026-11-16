import { expect, test } from '@playwright/test';

// Las páginas por rol se cargan con React.lazy: estas pruebas confirman que
// los chunks diferidos se descargan bien y que las rutas privadas siguen protegidas.

test('una página cargada bajo demanda se muestra correctamente', async ({ page }) => {
  await page.goto('/terminos');
  await expect(page.getByRole('heading', { level: 1, name: /términos de uso/i })).toBeVisible();
});

test('una ruta privada redirige al login si no hay sesión', async ({ page }) => {
  await page.goto('/admin');
  await expect(page).toHaveURL(/\/login$/);
});
