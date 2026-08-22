import { copyFileSync, mkdirSync } from 'node:fs';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		svelte(),
		{
			name: 'zadmin-plugin-manifest',
			closeBundle() {
				mkdirSync('dist', { recursive: true });
				copyFileSync('zadmin.plugin.json', 'dist/zadmin.plugin.json');
			}
		}
	],
	build: {
		emptyOutDir: true,
		lib: {
			entry: {
				'client/index': 'src/client/index.ts',
				'server/index': 'src/server/index.ts'
			},
			formats: ['es'],
			fileName: (_format, entryName) => `${entryName}.js`
		},
		outDir: 'dist',
		sourcemap: true,
		target: 'es2024'
	}
});
