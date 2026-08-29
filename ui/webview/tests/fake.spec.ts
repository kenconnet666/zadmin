import { describe, expect, it, vi } from 'vitest';

import { createDesktopResourceScope } from '../src/platform/index.js';
import { createFakeWebviewDriver, expectDesktopOk } from '../src/testing/index.js';

describe('fake WebView driver', () => {
	it('executes clipboard, files, store and URL policy through the real bridge', async () => {
		const driver = createFakeWebviewDriver();
		expectDesktopOk(await driver.platform.clipboard.writeText('hello'));
		expect(expectDesktopOk(await driver.platform.clipboard.readText())).toBe('hello');
		expectDesktopOk(await driver.platform.filesystem.writeText('notes.txt', 'body'));
		expect(expectDesktopOk(await driver.platform.filesystem.exists('notes.txt'))).toBe(true);
		expectDesktopOk(await driver.platform.store.set('theme', 'dark'));
		expect(expectDesktopOk(await driver.platform.store.get('theme'))).toBe('dark');
		expectDesktopOk(await driver.platform.opener.openUrl('https://docs.zadmin.dev/start'));
		expect(driver.state.openedUrls).toEqual(['https://docs.zadmin.dev/start']);
		expect(driver.requests.map((request) => request.method)).toContain('store.set');
	});

	it('publishes window state events and releases scoped listeners', async () => {
		const driver = createFakeWebviewDriver();
		const scope = createDesktopResourceScope();
		const scoped = driver.platform.forScope(scope);
		const listener = vi.fn();
		expectDesktopOk(await scoped.window.listen(listener));
		expectDesktopOk(await scoped.window.maximize());
		expect(listener).toHaveBeenCalledWith(expect.objectContaining({ maximized: true }));
		await scope.dispose();
		driver.emit('window.changed', { ...driver.state.window, maximized: false });
		expect(listener).toHaveBeenCalledOnce();
	});

	it('tracks notification, log and window actions', async () => {
		const driver = createFakeWebviewDriver();
		expect(expectDesktopOk(await driver.platform.app.snapshot()).name).toBe('ZAdmin');
		expect(expectDesktopOk(await driver.platform.os.snapshot()).platform).toBe('windows');
		expect(expectDesktopOk(await driver.platform.window.snapshot()).width).toBe(1280);
		expectDesktopOk(await driver.platform.log.write({ level: 'info', message: 'ready' }));
		expect(expectDesktopOk(await driver.platform.notification.permission())).toBe('granted');
		expect(expectDesktopOk(await driver.platform.notification.requestPermission())).toBe('granted');
		expectDesktopOk(await driver.platform.notification.send({ title: 'Ready' }));
		expectDesktopOk(await driver.platform.window.minimize());
		expectDesktopOk(await driver.platform.window.restore());
		expectDesktopOk(await driver.platform.window.toggleMaximize());
		expectDesktopOk(await driver.platform.window.startDragging());
		expectDesktopOk(await driver.platform.window.close());
		expectDesktopOk(await driver.platform.windowState.save());
		expectDesktopOk(await driver.platform.windowState.restore());
		expect(driver.state.logs).toHaveLength(1);
		expect(driver.state.notifications).toEqual([{ title: 'Ready' }]);
		expect(driver.state.windowActions).toContain('window.minimize');
	});

	it('covers dialogs, destructive guards, process, updater and store lifecycle', async () => {
		const driver = createFakeWebviewDriver();
		expect(expectDesktopOk(await driver.platform.dialog.open())).toEqual([]);
		expect(expectDesktopOk(await driver.platform.dialog.save())).toBeNull();
		expectDesktopOk(await driver.platform.filesystem.writeText('delete.txt', 'value'));
		expect(expectDesktopOk(await driver.platform.filesystem.readText('delete.txt'))).toBe('value');
		expectDesktopOk(await driver.platform.filesystem.remove('delete.txt', { confirmed: true }));
		expectDesktopOk(await driver.platform.process.exit({ confirmed: true }, 7));
		expectDesktopOk(await driver.platform.process.relaunch({ confirmed: true }));
		expect(expectDesktopOk(await driver.platform.updater.check())).toBeNull();
		expectDesktopOk(await driver.platform.store.set('one', 1));
		expect(expectDesktopOk(await driver.platform.store.keys())).toEqual(['one']);
		expect(expectDesktopOk(await driver.platform.store.delete('one'))).toBe(true);
		expectDesktopOk(await driver.platform.store.set('two', 2));
		expectDesktopOk(await driver.platform.store.save());
		expectDesktopOk(await driver.platform.store.clear());
		expectDesktopOk(await driver.platform.clipboard.writeText('clear'));
		expectDesktopOk(await driver.platform.clipboard.clear());
		expect(expectDesktopOk(await driver.platform.clipboard.readText())).toBe('');
		expect(driver.platform.environment.snapshot()).toMatchObject({ runtime: 'webview' });
	});

	it('rejects an external URL before it reaches the host', async () => {
		const driver = createFakeWebviewDriver();
		await expect(driver.platform.opener.openUrl('https://evil.example')).resolves.toMatchObject({
			error: { code: 'permission-denied' },
			ok: false
		});
		expect(driver.state.openedUrls).toEqual([]);
	});
});
