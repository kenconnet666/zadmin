import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
	outputDir: 'test-results',
	reporter: [['line'], ['html', { open: 'never' }]],
	testDir: './tests',
	testMatch: '**/*.e2e.ts',
	projects: [
		{ name: 'chromium', use: { ...devices['Desktop Chrome'] } },
		{ name: 'firefox', use: { ...devices['Desktop Firefox'] } },
		{ name: 'webkit', use: { ...devices['Desktop Safari'] } }
	],
	use: {
		baseURL: 'http://127.0.0.1:4174',
		screenshot: 'only-on-failure',
		trace: 'retain-on-failure',
		video: 'retain-on-failure'
	},
	webServer: {
		command: 'pnpm build && pnpm preview',
		port: 4174,
		reuseExistingServer: !process.env.CI
	}
});
