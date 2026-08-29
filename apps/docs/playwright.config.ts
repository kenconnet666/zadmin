import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
	testDir: './tests',
	testMatch: '**/*.e2e.ts',
	projects: [
		{ name: 'chromium', use: { ...devices['Desktop Chrome'] } },
		{ name: 'firefox', use: { ...devices['Desktop Firefox'] } },
		{ name: 'webkit', use: { ...devices['Desktop Safari'] } }
	],
	use: { baseURL: 'http://127.0.0.1:4174' },
	webServer: {
		command: 'pnpm build && pnpm preview',
		port: 4174,
		reuseExistingServer: !process.env.CI
	}
});
