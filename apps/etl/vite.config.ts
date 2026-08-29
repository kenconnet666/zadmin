import adapter from '@sveltejs/adapter-node';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit({ adapter: adapter() })],
	preview: {
		host: '0.0.0.0',
		port: 4175,
		strictPort: true
	},
	resolve: {
		dedupe: ['svelte']
	},
	server: {
		host: '0.0.0.0',
		port: 5175,
		strictPort: true
	},
	ssr: {
		noExternal: [/^@zadmin\//]
	}
});
