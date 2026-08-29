import { svelte } from '@sveltejs/vite-plugin-svelte';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

const collectingCoverage = process.argv.includes('--coverage');
const focusedBrowser = process.env.ZUI_BROWSER;
const browserInstances: { browser: 'chromium' | 'firefox' | 'webkit' }[] = collectingCoverage
	? [{ browser: 'chromium' as const }]
	: focusedBrowser === 'chromium' || focusedBrowser === 'firefox' || focusedBrowser === 'webkit'
		? [{ browser: focusedBrowser }]
		: [{ browser: 'chromium' }, { browser: 'firefox' }, { browser: 'webkit' }];

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
			'shiki/themes/github-dark.mjs',
			'shiki/themes/github-light.mjs'
		]
	},
	plugins: [svelte()],
	test: {
		coverage: {
			exclude: ['dist/**', 'tests/**'],
			provider: 'v8',
			reporter: ['text', 'json-summary'],
			thresholds: {
				branches: 90,
				functions: 95,
				lines: 95,
				statements: 95,
				'src/compiler/**': {
					branches: 90,
					functions: 100,
					lines: 95,
					statements: 90
				},
				'src/components/**': {
					branches: 85,
					functions: 85,
					lines: 85,
					statements: 85
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
							port: 63315,
							strictPort: true
						},
						enabled: true,
						headless: true,
						instances: browserInstances,
						provider: playwright()
					},
					include: ['tests/**/*.browser.spec.ts'],
					name: 'browser'
				}
			}
		]
	}
});
