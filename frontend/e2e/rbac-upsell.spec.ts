import { test, expect } from '@playwright/test'

test.describe('RBAC System - Basic Tier Feature Gating & Upsell Card', () => {
  test('Renders company_settings_basic_tier_upsell state for Basic tier users', async ({ page }) => {
    // Navigate to Company Settings
    await page.goto('/dashboard/settings')

    // Verify Basic Tier upsell overlay card is visible
    const upsellCard = page.locator('[data-testid="basic-tier-upsell-card"]')
    await expect(upsellCard).toBeVisible()

    // Verify header title inside upsell card
    await expect(page.locator('text=Unlock Pro Features')).toBeVisible()

    // Verify CTA button redirects to upgrade flow
    const ctaButton = page.locator('[data-testid="unlock-pro-cta"]')
    await expect(ctaButton).toBeVisible()
    await ctaButton.click()
    await expect(page).toHaveURL('/dashboard/upgrade')
  })
})
