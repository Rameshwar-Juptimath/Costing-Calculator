import { test, expect } from '@playwright/test'

test.describe('Estimator Workspace - Real-Time Sticky Footer Calculation', () => {
  test('Sticky footer accurately calculates total sum of JetBrains Mono inputs in real-time', async ({ page }) => {
    // Navigate directly to dashboard workspace
    await page.goto('/dashboard')

    // Find inputs by data-testid
    const rawMaterialInput = page.locator('[data-testid="input-raw-material"]')
    const toolingInput = page.locator('[data-testid="input-tooling"]')
    const manufacturingInput = page.locator('[data-testid="input-manufacturing"]')
    const labourInput = page.locator('[data-testid="input-labour"]')
    const inspectionInput = page.locator('[data-testid="input-inspection"]')
    const logisticsInput = page.locator('[data-testid="input-logistics"]')

    // Fill numerical inputs
    await rawMaterialInput.fill('10000')
    await toolingInput.fill('5000')
    await manufacturingInput.fill('15000')
    await labourInput.fill('4000')
    await inspectionInput.fill('2000')
    await logisticsInput.fill('3000')

    // Total should be: 10000 + 5000 + 15000 + 4000 + 2000 + 3000 = 39,000.00
    const stickyFooterTotal = page.locator('[data-testid="sticky-footer-total"]')
    await expect(stickyFooterTotal).toBeVisible()
    await expect(stickyFooterTotal).toContainText('39,000.00')

    // Change an input and verify real-time update
    await rawMaterialInput.fill('20000')
    // New total: 20000 + 5000 + 15000 + 4000 + 2000 + 3000 = 49,000.00
    await expect(stickyFooterTotal).toContainText('49,000.00')
  })
})
