import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	base: './',
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
