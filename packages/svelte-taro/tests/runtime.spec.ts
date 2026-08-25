import { document, eventHandler, safeExecute } from '@tarojs/runtime';
import { beforeEach, describe, expect, it } from 'vitest';

import { createSvelteApp } from '../src/runtime/index.ts';
import RuntimeApp from './RuntimeApp.svelte';
import RuntimePage from './RuntimePage.svelte';
import {
	lifecycleEvents,
	resetLifecycleEvents,
	setRuntimeNavigation
} from './lifecycle-tracker.ts';

beforeEach(resetLifecycleEvents);

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

	it('preserves Svelte context when a page is mounted synchronously from an event', async () => {
		const app = createSvelteApp(RuntimeApp, {});
		await new Promise<void>((resolve) => app.mount(RuntimePage, 'runtime-source', resolve));
		const source = document.getElementById('runtime-source');
		const button = document.getElementById('runtime-navigate');
		if (source === null || button === null) throw new Error('Navigation fixture was not mounted.');

		const mounted = new Promise<void>((resolve) => {
			setRuntimeNavigation(() => app.mount(RuntimePage, 'runtime-target', resolve));
		});
		eventHandler({
			currentTarget: { dataset: {}, id: 'runtime-navigate' },
			detail: {},
			target: { dataset: {}, id: 'runtime-navigate' },
			type: 'tap'
		} as never);
		await mounted;
		expect(document.getElementById('runtime-target')?.textContent).toContain('platform:ready');

		await new Promise<void>((resolve) => app.unmount('runtime-source', resolve));
		await new Promise<void>((resolve) => app.unmount('runtime-target', resolve));
		await app.dispose();
	});

	it('routes App/Page lifecycle hooks and releases 100 isolated page instances', async () => {
		const app = createSvelteApp(RuntimeApp, {}) as ReturnType<typeof createSvelteApp> & {
			onHide(): void;
			onLaunch(options?: Record<string, unknown>): void;
			onShow(options?: Record<string, unknown>): void;
		};
		app.onLaunch({ query: { fixture: 'yes' } });
		app.onShow();
		app.onHide();
		expect(lifecycleEvents).toEqual(['app:launch', 'app:show', 'app:hide']);

		for (let index = 0; index < 100; index += 1) {
			const id = `runtime-page-${index}`;
			await new Promise<void>((resolve) => app.mount(RuntimePage, id, resolve));
			safeExecute(id, 'onLoad');
			safeExecute(id, 'onReady');
			safeExecute(id, 'onUnload');
			await new Promise<void>((resolve) => app.unmount(id, resolve));
			expect(document.getElementById(id)).toBeNull();
		}
		expect(lifecycleEvents.filter((event) => event === 'page:load')).toHaveLength(100);
		expect(lifecycleEvents.filter((event) => event === 'page:ready')).toHaveLength(100);
		expect(lifecycleEvents.filter((event) => event === 'page:unload')).toHaveLength(100);
		await app.dispose();
	});
});
