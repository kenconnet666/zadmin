import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	base: './',
	plugins: [svelte()],
	preview: {
		host: '0.0.0.0',
		port: 4174,
		strictPort: true
	},
	resolve: {
		dedupe: ['svelte']
	},
	server: {
		host: '0.0.0.0',
		port: 5174,
		strictPort: true
	},
	test: {
		expect: { requireAssertions: true },
		include: ['src/**/*.spec.ts']
	}
});
