import { document } from '@tarojs/runtime';
import { describe, expect, it } from 'vitest';

import { createSvelteApp } from '../src/runtime/index.ts';
import RuntimeApp from './RuntimeApp.svelte';
import RuntimePage from './RuntimePage.svelte';

describe('Svelte Taro App/Page runtime', () => {
	it('mounts and unmounts pages under Taro roots', async () => {
		const app = createSvelteApp(RuntimeApp, {});
		await new Promise<void>((resolve) => app.mount(RuntimePage, 'runtime-page', resolve));
		const root = document.getElementById('runtime-page');
		expect(root?.nodeName).toBe('root');
		expect(root?.textContent).toContain('runtime:0');

		await new Promise<void>((resolve) => app.unmount('runtime-page', resolve));
		expect(document.getElementById('runtime-page')).toBeNull();
		await app.dispose();
	});
});
