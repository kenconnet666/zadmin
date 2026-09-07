import { defineConfig, devices, type ReporterDescription } from '@playwright/test';

const executionReport = process.env.PLAYWRIGHT_EXECUTION_REPORT;
const reporters: ReporterDescription[] = [['line'], ['html', { open: 'never' }]];
if (executionReport) reporters.push(['json', { outputFile: executionReport }]);
const executionMetadata = executionReport
	? {
			zuiExecution: {
				revision: process.env.GITHUB_SHA,
				runId: process.env.GITHUB_RUN_ID,
				runAttempt: Number(process.env.GITHUB_RUN_ATTEMPT),
				browser: process.env.ZUI_EXECUTION_BROWSER
			}
		}
	: undefined;

export default defineConfig({
	outputDir: 'test-results',
	reporter: reporters,
	metadata: executionMetadata,
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
