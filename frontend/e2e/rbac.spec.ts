import { test, expect } from '@playwright/test'

async function loginAs(page: any, email: string, password: string) {
  await page.goto('/login')
  await page.fill('[data-testid="email-input"]', email)
  await page.fill('[data-testid="password-input"]', password)
  await page.click('[data-testid="login-button"]')
  await page.waitForURL('/dashboard')
}

test.describe('RBAC — Basic Tier', () => {
  test.beforeEach(async ({ page }) => {
    // Requires backend to return Basic tier
    await loginAs(page, 'admin@example.com', 'Admin@123!')
  })

  test('Step 2 (Overhead) shows upsell modal, not form inputs', async ({ page }) => {
    await page.goto('/estimate')
    await page.click('[data-testid="step-next-btn"]')
    await expect(page.locator('[data-testid="upsell-modal-trigger"]')).toBeVisible()
    await expect(page.locator('[data-testid="overhead-form"]')).not.toBeVisible()
  })

  test('Clicking locked overlay opens upsell modal', async ({ page }) => {
    await page.goto('/estimate')
    await page.click('[data-testid="step-next-btn"]')
    await page.click('[data-testid="upsell-modal-trigger"]')
    await expect(page.locator('[data-testid="upsell-modal"]')).toBeVisible()
    await expect(page.locator('text=Upgrade to Pro')).toBeVisible()
  })

  test('Dashboard shows Basic tier badge', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page.locator('[data-testid="tier-badge"]')).toContainText('Basic')
  })
})

test('Logout redirects to login page', async ({ page }) => {
  await loginAs(page, 'admin@example.com', 'Admin@123!')
  await page.click('[data-testid="logout-button"]')
  await expect(page).toHaveURL('/login')
})

test('Protected route without token redirects to login', async ({ page }) => {
  await page.goto('/dashboard')
  await expect(page).toHaveURL('/login')
})
