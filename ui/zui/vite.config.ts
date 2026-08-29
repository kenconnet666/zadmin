import { svelte } from '@sveltejs/vite-plugin-svelte';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

const collectingCoverage = process.argv.includes('--coverage');

export default defineConfig({
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
				'src/lib/compiler/**': {
					branches: 90,
					functions: 100,
					lines: 95,
					statements: 90
				},
				'src/lib/components/**': {
					branches: 85,
					functions: 85,
					lines: 85,
					statements: 85
				},
				'src/lib/icss/**': {
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
						instances: collectingCoverage
							? [{ browser: 'chromium' }]
							: [{ browser: 'chromium' }, { browser: 'firefox' }, { browser: 'webkit' }],
						provider: playwright()
					},
					include: ['tests/**/*.browser.spec.ts'],
					name: 'browser'
				}
			}
		]
	}
});
