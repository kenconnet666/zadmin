import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [svelte()],
	test: {
		coverage: {
			exclude: ['dist/**', 'tests/**'],
			provider: 'v8',
			reporter: ['text', 'json-summary']
		}
	}
});
