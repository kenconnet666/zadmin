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
	server: {
		host: '127.0.0.1',
		port: 5173,
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
