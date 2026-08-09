import { test, expect } from '@playwright/test'

test.describe('Estimator Workspace - Process Routing & Real-Time Calculation', () => {
  test('Accurately amortizes setup time across batch sizes and updates sticky footer in real-time', async ({ page }) => {
    // Navigate directly to dashboard workspace
    await page.goto('/dashboard')

    // Direct Cost Inputs
    const rawMaterialInput = page.locator('[data-testid="input-raw-material"]')
    const toolingInput = page.locator('[data-testid="input-tooling"]')
    const labourInput = page.locator('[data-testid="input-labour"]')
    const inspectionInput = page.locator('[data-testid="input-inspection"]')
    const logisticsInput = page.locator('[data-testid="input-logistics"]')
    const batchSizeInput = page.locator('[data-testid="input-batch-size"]')

    // Fill direct material & tooling
    await rawMaterialInput.fill('10000')
    await toolingInput.fill('5000')
    await labourInput.fill('4000')
    await inspectionInput.fill('2000')
    await logisticsInput.fill('3000')

    // Configure Routing Step 1: 60 mins setup, 12 mins cycle on 3-Axis CNC VMC (₹1500/hr)
    const setupInput = page.locator('[data-testid="routing-step-setup-time"]').first()
    const cycleInput = page.locator('[data-testid="routing-step-cycle-time"]').first()

    await setupInput.fill('60')
    await cycleInput.fill('12')
    await batchSizeInput.fill('100')

    // Setup/pc = (1 hr * 1500) / 100 = 15.00
    // Cycle/pc = (0.2 hr * 1500) = 300.00
    // Step Mfg Total = 315.00
    // Direct Total = 10000 + 5000 + 315 + 4000 + 2000 + 3000 = 24,315.00
    const stickyFooterTotal = page.locator('[data-testid="sticky-footer-total"]')
    await expect(stickyFooterTotal).toBeVisible()
    await expect(stickyFooterTotal).toContainText('24,315.00')

    // Change batch size to 10 (setup amortization increases from 15 to 150)
    // New Mfg Total = 150 + 300 = 450.00
    // New Direct Total = 10000 + 5000 + 450 + 4000 + 2000 + 3000 = 24,450.00
    await batchSizeInput.fill('10')
    await expect(stickyFooterTotal).toContainText('24,450.00')

    // Add another routing step
    const addStepBtn = page.locator('[data-testid="add-routing-step-btn"]')
    await addStepBtn.click()

    const stepRows = page.locator('[data-testid="routing-step-row"]')
    await expect(stepRows).toHaveCount(2)
  })

  test('Estimator Workspace displays dynamic unique quote reference number', async ({ page }) => {
    await page.goto('/dashboard')
    const refBadge = page.locator('[data-testid="quote-ref-badge"]')
    await expect(refBadge).toBeVisible()
    const initialText = await refBadge.innerText()
    expect(initialText).toMatch(/^Ref: CE-\d{4}$/)
  })
})
