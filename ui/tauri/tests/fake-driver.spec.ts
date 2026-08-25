import { describe, expect, it, vi } from 'vitest';

import { createFakeDesktopDriver, expectDesktopOk } from '../src/testing/index.js';

describe('fake desktop driver', () => {
	it('supports clipboard, store, notifications, and safe opener workflows', async () => {
		const { platform, state } = createFakeDesktopDriver();

		expectDesktopOk(await platform.clipboard.writeText('hello'));
		expect(expectDesktopOk(await platform.clipboard.readText())).toBe('hello');
		expectDesktopOk(await platform.store.set('theme', { mode: 'dark' }));
		expect(expectDesktopOk(await platform.store.get('theme'))).toEqual({ mode: 'dark' });
		expectDesktopOk(await platform.notification.send({ body: 'ready', title: 'ZAdmin' }));
		expectDesktopOk(await platform.opener.openUrl('https://v2.tauri.app/plugin/'));

		expect(state.notifications).toHaveLength(1);
		expect(state.openedUrls).toEqual(['https://v2.tauri.app/plugin/']);
		expect(await platform.opener.openUrl('https://example.com')).toMatchObject({
			error: { code: 'permission-denied' },
			ok: false
		});
	});

	it('roundtrips files and releases watchers', async () => {
		const { platform } = createFakeDesktopDriver();
		const listener = vi.fn();
		const handle = expectDesktopOk(await platform.filesystem.watch('probe.txt', listener));

		expectDesktopOk(await platform.filesystem.writeText('probe.txt', 'ready'));
		expect(expectDesktopOk(await platform.filesystem.readText('probe.txt'))).toBe('ready');
		expect(expectDesktopOk(await platform.filesystem.stat('probe.txt')).size).toBe(5);
		expect(listener).toHaveBeenCalledOnce();

		await handle.dispose();
		expectDesktopOk(await platform.filesystem.remove('probe.txt'));
		expect(listener).toHaveBeenCalledOnce();
	});

	it('tracks window state and releases listeners', async () => {
		const { platform, state } = createFakeDesktopDriver();
		const listener = vi.fn();
		const handle = expectDesktopOk(await platform.window.listen(listener));

		expectDesktopOk(await platform.window.maximize());
		expect(expectDesktopOk(await platform.window.snapshot()).maximized).toBe(true);
		expect(listener).toHaveBeenCalledOnce();
		await handle.dispose();
		expectDesktopOk(await platform.window.restore());
		expect(listener).toHaveBeenCalledOnce();
		expect(state.windowActions).toEqual(['maximize', 'restore']);
	});

	it('records destructive operations without affecting the process', async () => {
		const { platform, state } = createFakeDesktopDriver();
		expectDesktopOk(await platform.process.exit({ confirmed: true }, 7));
		expectDesktopOk(await platform.process.relaunch({ confirmed: true }));
		expectDesktopOk(await platform.window.close({ confirmed: true }));

		expect(state.exitCodes).toEqual([7]);
		expect(state.relaunches).toBe(1);
		expect(state.windowActions).toContain('close');
	});
});
