import { svelte } from '@sveltejs/vite-plugin-svelte';
import { playwright } from '@vitest/browser-playwright';
import { fileURLToPath } from 'node:url';
import { defineConfig, type TestProjectConfiguration } from 'vitest/config';
import { createComponentExecutionReporter } from './scripts/component-execution-reporter.js';
import { dragElements, dragSliderTrack } from './tests/browser-commands.js';

const collectingCoverage = process.argv.includes('--coverage');
const packageRoot = fileURLToPath(new URL('.', import.meta.url));
const focusedBrowser = process.env.ZUI_BROWSER;
const executionReportPath = process.env.ZUI_EXECUTION_REPORT;
const executionReporter =
	executionReportPath !== undefined
		? createComponentExecutionReporter({
				packageRoot,
				outputFile: executionReportPath,
				revision: process.env.GITHUB_SHA ?? '',
				runId: process.env.GITHUB_RUN_ID ?? '',
				runAttempt: Number(process.env.GITHUB_RUN_ATTEMPT ?? '')
			})
		: undefined;
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
// Firefox's Playwright provider is not reliable when Vitest creates pages for
// multiple browser files concurrently. On Windows it can fail inside
// browserContext.newPage; under the Linux multi-browser gate it can starve
// iframe focus/Portal work until the assertion timeout. Keep focused Chromium
// and WebKit local runs parallel. Keep the non-coverage CI file concurrency unchanged
// when each browser moves to its own job; isolation must not also raise per-job load.
const requiresSerialBrowserFiles =
	browserInstances.some(({ browser }) => browser === 'firefox') ||
	(process.env.CI === 'true' && !collectingCoverage);

// Shared browser infrastructure; specialized probes replace only their scope and commands.
export const browserProject = {
	extends: true,
	test: {
		// API belongs to this browser project, not the root/unit server.
		api: {
			host: '127.0.0.1',
			port: configuredBrowserPort,
			strictPort: true
		},
		browser: {
			commands: { dragElements, dragSliderTrack },
			enabled: true,
			headless: true,
			// Full Chromium uses modern headless; other engines and concurrency stay unchanged.
			instances: browserInstances.map((instance) =>
				instance.browser === 'chromium'
					? {
							...instance,
							provider: playwright({ launchOptions: { channel: 'chromium' } })
						}
					: instance
			),
			provider: playwright()
		},
		include: ['tests/**/*.browser.spec.ts'],
		name: 'browser',
		setupFiles: ['./tests/browser.setup.ts']
	}
} satisfies TestProjectConfiguration;

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
		includeTaskLocation: executionReporter !== undefined,
		maxWorkers: requiresSerialBrowserFiles ? 1 : undefined,
		reporters: executionReporter === undefined ? ['default'] : ['default', executionReporter],
		coverage: {
			exclude: ['dist/**', 'tests/**', 'src/entrypoints/**'],
			provider: 'v8',
			// Retain exact uncovered statement/branch locations for the remote coverage gate.
			reporter: ['text', 'json-summary', 'json'],
			// A failing test must not hide diagnostic coverage; its failure still fails the job.
			reportOnFailure: true,
			thresholds: {
				// Mature target: 95% lines/statements/functions and 90% branches.
				// The current suite is below those targets, so negative thresholds
				// enforce a no-regression ceiling on uncovered items until the target
				// is reached (Vitest interprets negative values as uncovered budgets).
				branches: -1997,
				functions: -308,
				lines: -894,
				statements: -1707,
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
					branches: -1750,
					functions: -276,
					lines: -822,
					statements: -1531
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
			browserProject
		]
	}
});
