import { svelte } from '@sveltejs/vite-plugin-svelte';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

const collectingCoverage = process.argv.includes('--coverage');
const focusedBrowser = process.env.ZUI_BROWSER;
const configuredBrowserPort = Number(process.env.ZUI_BROWSER_PORT ?? 63315);
if (
	!Number.isInteger(configuredBrowserPort) ||
	configuredBrowserPort < 1 ||
	configuredBrowserPort > 65535
) {
	throw new TypeError('ZUI_BROWSER_PORT must be an integer from 1 through 65535.');
}
const browserInstances: { browser: 'chromium' | 'firefox' | 'webkit' }[] = collectingCoverage
	? [{ browser: 'chromium' as const }]
	: focusedBrowser === 'chromium' || focusedBrowser === 'firefox' || focusedBrowser === 'webkit'
		? [{ browser: focusedBrowser }]
		: [{ browser: 'chromium' }, { browser: 'firefox' }, { browser: 'webkit' }];
const requiresSerialBrowserFiles =
	process.platform === 'win32' && browserInstances.some(({ browser }) => browser === 'firefox');

export default defineConfig({
	optimizeDeps: {
		include: [
			'shiki/core',
			'shiki/engine/javascript',
			'shiki/langs/bash.mjs',
			'shiki/langs/css.mjs',
			'shiki/langs/javascript.mjs',
			'shiki/langs/json.mjs',
			'shiki/langs/svelte.mjs',
			'shiki/langs/typescript.mjs',
			'shiki/themes/github-dark-high-contrast.mjs',
			'shiki/themes/github-light-high-contrast.mjs'
		]
	},
	plugins: [svelte()],
	test: {
		fileParallelism: !requiresSerialBrowserFiles,
		maxWorkers: requiresSerialBrowserFiles ? 1 : undefined,
		coverage: {
			exclude: ['dist/**', 'tests/**', 'src/entrypoints/**'],
			provider: 'v8',
			reporter: ['text', 'json-summary'],
			thresholds: {
				// Mature target: 95% lines/statements/functions and 90% branches.
				// The current suite is below those targets, so negative thresholds
				// enforce a no-regression ceiling on uncovered items until the target
				// is reached (Vitest interprets negative values as uncovered budgets).
				branches: -1993,
				functions: -307,
				lines: -891,
				statements: -1703,
				'src/compiler/**': {
					branches: 90,
					functions: 100,
					lines: 95,
					statements: 90
				},
				'src/components/**': {
					// Component maturity target: 85% for every metric. Until all
					// components meet it, keep the measured uncovered-item budgets
					// below as a no-regression gate rather than lowering percentages.
					branches: -1746,
					functions: -275,
					lines: -819,
					statements: -1527
				},
				'src/icss/**': {
					branches: 90,
					functions: 95,
					lines: 95,
					statements: 95
				}
			}
		},
		projects: [
			{
				extends: true,
				test: {
					exclude: ['tests/**/*.browser.spec.ts'],
					include: ['tests/**/*.spec.ts'],
					name: 'unit'
				}
			},
			{
				extends: true,
				test: {
					browser: {
						api: {
							host: '127.0.0.1',
							port: configuredBrowserPort,
							strictPort: true
						},
						enabled: true,
						headless: true,
						instances: browserInstances,
						provider: playwright()
					},
					include: ['tests/**/*.browser.spec.ts'],
					name: 'browser',
					setupFiles: ['./tests/browser.setup.ts']
				}
			}
		]
	}
});
