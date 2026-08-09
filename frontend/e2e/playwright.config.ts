import { defineConfig, devices } from '@playwright/test'
export default defineConfig({
  testDir: './',
  use: { baseURL: 'http://localhost:3030', headless: true },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: { command: 'npm run dev', url: 'http://localhost:3030', reuseExistingServer: true },
})
