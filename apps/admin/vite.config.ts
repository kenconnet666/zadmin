import adapter from '@sveltejs/adapter-node';
import { sveltekit } from '@sveltejs/kit/vite';
import { icssPreprocess } from '@zadmin/zui/compiler';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit({ adapter: adapter(), preprocess: [icssPreprocess()] })],
	resolve: {
		dedupe: ['svelte']
	},
	ssr: {
		noExternal: [/^@zadmin\//]
	},
	preview: {
		host: '0.0.0.0',
		port: 4173,
		strictPort: true
	},
	server: {
		host: '0.0.0.0',
		port: 5173,
		strictPort: true,
		watch: {
			ignored: ['**/plugins/*/dist/**']
		}
	}
});
