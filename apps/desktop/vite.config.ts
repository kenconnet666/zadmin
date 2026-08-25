import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	clearScreen: false,
	optimizeDeps: {
		include: [
			'@tauri-apps/api/app',
			'@tauri-apps/api/core',
			'@tauri-apps/api/event',
			'@tauri-apps/api/path',
			'@tauri-apps/api/window',
			'@zadmin/tauri > @tauri-apps/plugin-clipboard-manager',
			'@zadmin/tauri > @tauri-apps/plugin-dialog',
			'@zadmin/tauri > @tauri-apps/plugin-fs',
			'@zadmin/tauri > @tauri-apps/plugin-log',
			'@zadmin/tauri > @tauri-apps/plugin-notification',
			'@zadmin/tauri > @tauri-apps/plugin-opener',
			'@zadmin/tauri > @tauri-apps/plugin-os',
			'@zadmin/tauri > @tauri-apps/plugin-process',
			'@zadmin/tauri > @tauri-apps/plugin-store',
			'@zadmin/tauri > @tauri-apps/plugin-window-state',
			'@zadmin/zui-svelte > stylis'
		]
	},
	plugins: [sveltekit()],
	server: {
		host: '127.0.0.1',
		port: 5173,
		strictPort: true,
		watch: {
			ignored: ['**/src-tauri/gen/**', '**/src-tauri/target/**']
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
