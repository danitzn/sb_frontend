import { test, expect } from '@playwright/test'

test('la página principal carga el chatbot', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { name: 'Lynda Carolyn Chatbot' })).toBeVisible()
  await expect(page.getByText('¡Hola! Soy Celeste, tu asistente')).toBeVisible()
})
