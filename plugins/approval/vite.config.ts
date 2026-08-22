import { svelte } from '@sveltejs/vite-plugin-svelte';
import { zadminPlugin } from '@zadmin/core/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [...zadminPlugin(), svelte()],
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
