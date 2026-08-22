import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => ({
	plugins: [svelte()],
	build: {
		emptyOutDir: mode === 'server',
		lib: {
			entry: mode === 'server' ? 'src/server/index.ts' : 'src/client/index.ts',
			formats: ['es'],
			fileName: () => `${mode}/index.js`
		},
		outDir: 'dist',
		sourcemap: true,
		target: mode === 'server' ? 'node24' : 'es2024'
	}
}));
