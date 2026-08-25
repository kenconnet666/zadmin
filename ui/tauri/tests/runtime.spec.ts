import { describe, expect, it, vi } from 'vitest';

import {
	captureDesktop,
	createDesktopResourceHandle,
	createUnsupportedDesktopPlatform,
	DesktopResourceScope,
	isJsonValue,
	normalizeDesktopError,
	validateExternalUrl,
	withDesktopCommands
} from '../src/index.js';

describe('desktop runtime contracts', () => {
	it('normalizes permission and transport failures', async () => {
		expect(normalizeDesktopError('fs.read', 'forbidden path').code).toBe('permission-denied');
		expect(normalizeDesktopError('ipc.call', 'argument deserialization failed').code).toBe(
			'transport-error'
		);

		const result = await captureDesktop('task', () => {
			throw new Error('boom');
		});
		expect(result).toMatchObject({ error: { code: 'system-error' }, ok: false });
		expect(normalizeDesktopError('object', { message: 'not running in Tauri' }).code).toBe(
			'unsupported'
		);
		expect(normalizeDesktopError('unknown', { reason: 'unknown' }).code).toBe('system-error');
	});

	it('allows only configured HTTPS origins', () => {
		const policy = { allowedOrigins: ['https://v2.tauri.app'] };
		expect(validateExternalUrl('https://v2.tauri.app/plugin/', policy).ok).toBe(true);
		expect(validateExternalUrl('http://v2.tauri.app', policy)).toMatchObject({
			error: { code: 'permission-denied' },
			ok: false
		});
		expect(validateExternalUrl('https://example.com', policy)).toMatchObject({
			error: { code: 'permission-denied' },
			ok: false
		});
		expect(validateExternalUrl('not a url', policy)).toMatchObject({
			error: { code: 'invalid-input' },
			ok: false
		});
	});

	it('accepts finite JSON and rejects non-JSON values', () => {
		expect(isJsonValue({ count: 1, nested: [true, null, 'ok'] })).toBe(true);
		expect(isJsonValue(Number.NaN)).toBe(false);
		expect(isJsonValue(new Date())).toBe(false);
	});

	it('disposes owned resources once in reverse order', async () => {
		const calls: number[] = [];
		const scope = new DesktopResourceScope();
		const first = scope.add(createDesktopResourceHandle(() => void calls.push(1)));
		scope.add(createDesktopResourceHandle(() => void calls.push(2)));

		await scope.dispose();
		await scope.dispose();
		await first.dispose();
		expect(calls).toEqual([2, 1]);
		expect(scope.disposed).toBe(true);
		const late = createDesktopResourceHandle(() => void calls.push(3));
		scope.add(late);
		await Promise.resolve();
		expect(late.disposed).toBe(true);
		await scope[Symbol.asyncDispose]();
	});

	it('reports cleanup failures without skipping other resources', async () => {
		const afterFailure = vi.fn();
		const scope = new DesktopResourceScope();
		scope.add(createDesktopResourceHandle(afterFailure));
		scope.add(
			createDesktopResourceHandle(() => {
				throw new Error('dispose failed');
			})
		);

		await expect(scope.dispose()).rejects.toBeInstanceOf(AggregateError);
		expect(afterFailure).toHaveBeenCalledOnce();
	});

	it('keeps generated command clients fully inferred', async () => {
		const commands = {
			ping: async (input: { value: number }) => ({ value: input.value + 1 })
		};
		const platform = withDesktopCommands(createUnsupportedDesktopPlatform(), commands);
		await expect(platform.commands.ping({ value: 1 })).resolves.toEqual({ value: 2 });
	});

	it('returns explicit unsupported results outside Tauri', async () => {
		const platform = createUnsupportedDesktopPlatform();
		expect(platform.environment.snapshot()).toEqual({ isTauri: false, runtime: 'browser' });
		const results = await Promise.all([
			platform.app.snapshot(),
			platform.clipboard.clear(),
			platform.clipboard.readText(),
			platform.clipboard.writeText('value'),
			platform.dialog.confirm('continue?'),
			platform.dialog.message('message'),
			platform.dialog.open(),
			platform.dialog.save(),
			platform.filesystem.exists('probe'),
			platform.filesystem.mkdir('probe'),
			platform.filesystem.readDir('probe'),
			platform.filesystem.readText('probe'),
			platform.filesystem.remove('probe'),
			platform.filesystem.stat('probe'),
			platform.filesystem.watch('probe', vi.fn()),
			platform.filesystem.writeText('probe', 'value'),
			platform.log.attach(vi.fn()),
			platform.log.debug('message'),
			platform.log.error('message'),
			platform.log.info('message'),
			platform.log.trace('message'),
			platform.log.warn('message'),
			platform.notification.isPermissionGranted(),
			platform.notification.requestPermission(),
			platform.notification.send('message'),
			platform.opener.openUrl('https://example.com'),
			platform.os.snapshot(),
			platform.process.exit({ confirmed: true }),
			platform.process.relaunch({ confirmed: true }),
			platform.store.clear(),
			platform.store.delete('key'),
			platform.store.get('key'),
			platform.store.has('key'),
			platform.store.keys(),
			platform.store.save(),
			platform.store.set('key', 'value'),
			platform.updater.check(),
			platform.window.close({ confirmed: true }),
			platform.window.listen(vi.fn()),
			platform.window.maximize(),
			platform.window.minimize(),
			platform.window.restore(),
			platform.window.snapshot(),
			platform.window.startDragging(),
			platform.window.toggleMaximize(),
			platform.windowState.filename(),
			platform.windowState.restore(),
			platform.windowState.save()
		]);
		expect(results.every((result) => !result.ok && result.error.code === 'unsupported')).toBe(true);
	});
});
