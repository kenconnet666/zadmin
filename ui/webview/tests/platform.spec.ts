import { describe, expect, it, vi } from 'vitest';

import {
	createDesktopResourceHandle,
	createDesktopResourceScope,
	createUnsupportedDesktopPlatform,
	createWebviewDesktopPlatform,
	validateExternalUrl
} from '../src/platform/index.js';
import type { WebviewClient } from '../src/bridge/client.js';

describe('desktop platform contracts', () => {
	it('requires an allowlisted HTTPS origin', () => {
		expect(
			validateExternalUrl('https://docs.zadmin.dev/guide', ['https://docs.zadmin.dev']).ok
		).toBe(true);
		expect(
			validateExternalUrl('http://docs.zadmin.dev', ['https://docs.zadmin.dev'])
		).toMatchObject({
			error: { code: 'permission-denied' },
			ok: false
		});
		expect(validateExternalUrl('https://evil.example', ['https://docs.zadmin.dev'])).toMatchObject({
			error: { code: 'permission-denied' },
			ok: false
		});
	});

	it('disposes scoped resources once in reverse ownership order', async () => {
		const calls: number[] = [];
		const scope = createDesktopResourceScope();
		const first = scope.add(
			createDesktopResourceHandle(() => {
				calls.push(1);
			})
		);
		scope.add(
			createDesktopResourceHandle(() => {
				calls.push(2);
			})
		);
		expect(scope.disposed).toBe(false);
		expect(first.disposed).toBe(false);
		await scope.dispose();
		await scope.dispose();
		expect(scope.disposed).toBe(true);
		expect(first.disposed).toBe(true);
		expect(calls).toEqual([2, 1]);
	});

	it('rejects resources added to a disposed scope', async () => {
		const dispose = vi.fn();
		const scope = createDesktopResourceScope();
		await scope.dispose();
		expect(() => scope.add(createDesktopResourceHandle(dispose))).toThrow('disposed');
		await vi.waitFor(() => expect(dispose).toHaveBeenCalledOnce());
	});

	it('provides a deterministic browser fallback', async () => {
		const platform = createUnsupportedDesktopPlatform('not hosted');
		expect(platform.environment.snapshot()).toMatchObject({ runtime: 'browser' });
		const results = await Promise.all([
			platform.app.snapshot(),
			platform.clipboard.clear(),
			platform.clipboard.readText(),
			platform.clipboard.writeText('value'),
			platform.dialog.open(),
			platform.dialog.save(),
			platform.filesystem.exists('file'),
			platform.filesystem.readText('file'),
			platform.filesystem.remove('file', { confirmed: true }),
			platform.filesystem.writeText('file', 'value'),
			platform.log.write({ level: 'info', message: 'value' }),
			platform.notification.permission(),
			platform.notification.requestPermission(),
			platform.notification.send({ title: 'value' }),
			platform.opener.openUrl('https://docs.zadmin.dev'),
			platform.os.snapshot(),
			platform.process.exit({ confirmed: true }),
			platform.process.relaunch({ confirmed: true }),
			platform.store.clear(),
			platform.store.delete('key'),
			platform.store.get('key'),
			platform.store.keys(),
			platform.store.save(),
			platform.store.set('key', 'value'),
			platform.updater.check(),
			platform.window.close(),
			platform.window.listen(() => undefined),
			platform.window.maximize(),
			platform.window.minimize(),
			platform.window.restore(),
			platform.window.snapshot(),
			platform.window.startDragging(),
			platform.window.toggleMaximize(),
			platform.windowState.restore(),
			platform.windowState.save()
		]);
		expect(results.every((result) => !result.ok)).toBe(true);
		expect(results[0]).toMatchObject({ error: { code: 'unsupported', message: 'not hosted' } });
		expect(platform.forScope(createDesktopResourceScope())).toBe(platform);
		expect(
			createWebviewDesktopPlatform({ opener: { allowedOrigins: [] } }).environment.snapshot()
				.runtime
		).toBe('browser');
	});

	it('preserves host failures while unwrapping facade DTOs', async () => {
		const client = {
			call: () => Promise.reject(new Error('WebView transport failed')),
			close: () => undefined,
			disposeHandle: () => undefined,
			on: () => () => undefined,
			origin: 'https://app.zadmin.local'
		} as WebviewClient;
		const platform = createWebviewDesktopPlatform(
			{ opener: { allowedOrigins: ['https://docs.zadmin.dev'] } },
			client
		);
		const results = await Promise.all([
			platform.clipboard.readText(),
			platform.dialog.open(),
			platform.dialog.save(),
			platform.filesystem.exists('file'),
			platform.filesystem.readText('file'),
			platform.store.delete('key'),
			platform.store.keys(),
			platform.opener.openUrl('https://docs.zadmin.dev/path')
		]);
		expect(results.every((result) => !result.ok && result.error.code === 'transport-error')).toBe(
			true
		);
	});
});
