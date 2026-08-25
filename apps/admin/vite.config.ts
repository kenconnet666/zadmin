import adapter from '@sveltejs/adapter-node';
import { sveltekit } from '@sveltejs/kit/vite';
import { icssPreprocess } from '@zadmin/zui-svelte/compiler';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit({ adapter: adapter(), preprocess: [icssPreprocess()] })],
	resolve: {
		dedupe: ['svelte']
	},
	ssr: {
		noExternal: [/^@zadmin\//]
	},
	server: {
		watch: {
			ignored: ['**/plugins/*/dist/**']
		}
	}
});
