import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	base: './',
	plugins: [svelte()],
	resolve: {
		dedupe: ['svelte']
	},
	test: {
		expect: { requireAssertions: true },
		include: ['src/**/*.spec.ts']
	}
});
