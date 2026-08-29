import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	build: {
		rolldownOptions: {
			output: { hashCharacters: 'hex' }
		}
	},
	clearScreen: false,
	plugins: [sveltekit()],
	preview: {
		host: '0.0.0.0',
		port: 4176,
		strictPort: true
	},
	server: {
		host: '0.0.0.0',
		port: 5176,
		strictPort: true,
		watch: {
			ignored: ['**/dist/desktop/**']
		}
	},
	test: {
		coverage: {
			exclude: ['build/**', 'src/lib/generated/**'],
			provider: 'v8',
			reporter: ['text', 'json-summary']
		}
	}
});
