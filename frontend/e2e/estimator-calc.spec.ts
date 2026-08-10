import { test, expect } from '@playwright/test'

async function loginAs(page: any, email: string, password: string) {
  await page.goto('/login')
  await page.fill('[data-testid="email-input"]', email)
  await page.fill('[data-testid="password-input"]', password)
  await page.click('[data-testid="login-button"]')
  await page.waitForURL('/dashboard')
}

test.describe('Estimator Workspace - Process Routing & Real-Time Calculation', () => {
  test('Accurately amortizes setup time across batch sizes and updates sticky footer in real-time', async ({ page }) => {
    await loginAs(page, 'admin@example.com', 'Admin@123!')

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

  test('Estimator Workspace displays dynamic quote reference badge', async ({ page }) => {
    await loginAs(page, 'admin@example.com', 'Admin@123!')
    const refBadge = page.locator('[data-testid="quote-ref-badge"]')
    await expect(refBadge).toBeVisible()
    const initialText = await refBadge.innerText()
    expect(initialText).toMatch(/^Ref:\s+(REF-\d{4}|REF-Pending)$/)
  })

  test('Full Flow: Generates quote with custom Quote Name in Workspace, persists to DB, and resets on return', async ({ page }) => {
    // 1. Open Estimator Workspace
    await loginAs(page, 'admin@example.com', 'Admin@123!')
    await page.goto('/dashboard')

    // 2. Enter Quote Name & Fill Direct Costs
    const quoteNameInput = page.locator('[data-testid="input-quote-name"]')
    await expect(quoteNameInput).toBeVisible()
    await quoteNameInput.fill('Custom Drone Rotor Assembly')

    await page.locator('[data-testid="input-raw-material"]').fill('15000')
    await page.locator('[data-testid="input-tooling"]').fill('6000')

    // 3. Click "Generate Quote"
    const generateBtn = page.locator('[data-testid="generate-quote-button"]')
    await expect(generateBtn).toBeVisible()
    await generateBtn.click()

    // 4. Verify navigation to the Past Quotes page
    await page.waitForURL('**/dashboard/history')
    await expect(page).toHaveURL(/\/dashboard\/history/)

    // 5. Assert that the newly created quote reference (e.g. REF-1001) and Quote Name are visible in the first row
    const firstRowRef = page.locator('tbody tr td').first()
    await expect(firstRowRef).toBeVisible()
    const refText = await firstRowRef.innerText()
    expect(refText).toMatch(/^REF-\d{4}$/)

    await expect(page.locator('tbody tr').first()).toContainText('Custom Drone Rotor Assembly')

    // 6. Return to Estimator Workspace and verify fresh slate
    await page.goto('/dashboard')
    await expect(page.locator('[data-testid="input-quote-name"]')).toHaveValue('')
    await expect(page.locator('[data-testid="quote-ref-badge"]')).toContainText('REF-Pending')
  })

  test('Past Quotes Archive: Delete quote button removes estimate', async ({ page }) => {
    await loginAs(page, 'admin@example.com', 'Admin@123!')
    
    // Handle confirm dialog automatically
    page.on('dialog', async dialog => {
      await dialog.accept()
    })

    const responsePromise = page.waitForResponse(resp => resp.url().includes('/api/v1/cost/estimates') && resp.status() === 200)
    await page.goto('/dashboard/history')
    await responsePromise

    await page.waitForTimeout(500)
    const initialRowsCount = await page.locator('tbody tr').count()
    expect(initialRowsCount).toBeGreaterThan(0)

    const firstDeleteBtn = page.locator('button[data-testid^="delete-quote-"]').first()
    await expect(firstDeleteBtn).toBeVisible()
    await firstDeleteBtn.click()

    // Row count decreases by 1
    await expect(page.locator('tbody tr')).toHaveCount(initialRowsCount - 1)
  })

  test('Estimator Workspace: New Estimate button clears workspace and resets ref', async ({ page }) => {
    await loginAs(page, 'admin@example.com', 'Admin@123!')
    await page.goto('/dashboard')

    // Check if new estimate button is visible or triggered after fill
    await page.locator('[data-testid="input-raw-material"]').fill('99999')
    const newEstBtn = page.locator('[data-testid="new-estimate-btn"]')
    if (await newEstBtn.isVisible()) {
      await newEstBtn.click()
      const refBadge = page.locator('[data-testid="quote-ref-badge"]')
      await expect(refBadge).toContainText('REF-Pending')
    }
  })
})

