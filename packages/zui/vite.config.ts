import { svelte } from '@sveltejs/vite-plugin-svelte';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [svelte()],
	test: {
		coverage: {
			exclude: ['dist/**', 'tests/**'],
			provider: 'v8',
			reporter: ['text', 'json-summary']
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
						enabled: true,
						headless: true,
						instances: [{ browser: 'chromium' }],
						provider: playwright()
					},
					include: ['tests/**/*.browser.spec.ts'],
					name: 'browser'
				}
			}
		]
	}
});
