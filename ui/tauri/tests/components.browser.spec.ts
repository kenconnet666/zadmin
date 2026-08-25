import { tick } from 'svelte';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';

import { createFakeDesktopDriver } from '../src/testing/index.js';
import { createUnsupportedDesktopPlatform } from '../src/index.js';
import DesktopBranchFixture from './DesktopBranchFixture.svelte';
import DesktopFixture from './DesktopFixture.svelte';
import NoDesktopProvider from './NoDesktopProvider.svelte';

describe('desktop Svelte integrations', () => {
	it('combines ZUI controls with fake native capabilities', async () => {
		const { platform, state } = createFakeDesktopDriver();
		state.clipboard = 'clipboard value';
		state.dialog.open = 'C:\\probe.txt';
		await render(DesktopFixture, { platform });

		document.querySelector<HTMLButtonElement>('[data-testid="file-picker"]')?.click();
		document.querySelector<HTMLButtonElement>('[data-testid="clipboard"]')?.click();
		document.querySelector<HTMLAnchorElement>('[data-testid="external"]')?.click();
		document.querySelector<HTMLButtonElement>('[data-testid="notification"]')?.click();
		await tick();

		await vi.waitFor(() => {
			expect(document.querySelector('[data-testid="selected"]')?.textContent).toBe('C:\\probe.txt');
			expect(document.querySelector('[data-testid="clipboard-value"]')?.textContent).toBe(
				'clipboard value'
			);
			expect(document.querySelector('[data-testid="notification-value"]')?.textContent).toBe(
				'sent'
			);
		});

		expect(state.openedUrls).toEqual(['https://v2.tauri.app/plugin/']);
		expect(state.notifications).toEqual(['Desktop ready']);
		expect(document.querySelector('[data-tauri-window-frame]')).not.toBeNull();
		expect(document.querySelector('[data-tauri-system-info]')?.textContent).toContain(
			'ZAdmin Desktop'
		);
	});

	it('keeps window controls synchronized and disposes their listener', async () => {
		const { platform, state } = createFakeDesktopDriver();
		const screen = await render(DesktopFixture, { platform });
		document.querySelector<HTMLButtonElement>('[aria-label="Maximize window"]')?.click();
		await vi.waitFor(() => {
			expect(state.window.maximized).toBe(true);
			expect(document.querySelector('[aria-label="Restore window"]')).not.toBeNull();
		});

		await screen.unmount();
		state.window = { ...state.window, maximized: false };
		expect(state.windowActions).toContain('maximize');
	});

	it('covers native action variants and title-bar gestures', async () => {
		const { platform, state } = createFakeDesktopDriver();
		state.dialog.open = 'C:\\directory';
		state.dialog.save = 'C:\\saved.txt';
		await render(DesktopBranchFixture, { platform });

		document.querySelector<HTMLButtonElement>('[data-testid="directory"]')?.click();
		await vi.waitFor(() =>
			expect(document.querySelector('[data-testid="selection"]')?.textContent).toBe('C:\\directory')
		);
		document.querySelector<HTMLButtonElement>('[data-testid="save"]')?.click();
		document.querySelector<HTMLButtonElement>('[data-testid="write"]')?.click();
		await vi.waitFor(() => expect(state.clipboard).toBe('written'));
		document.querySelector<HTMLButtonElement>('[data-testid="clear"]')?.click();
		document.querySelector<HTMLButtonElement>('[data-testid="permission"]')?.click();
		document.querySelector<HTMLAnchorElement>('[data-testid="blocked"]')?.click();

		const dragRegion = document.querySelector<HTMLElement>('[data-tauri-drag-region]');
		dragRegion?.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0 }));
		dragRegion?.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
		document.querySelector<HTMLButtonElement>('[aria-label="Minimize window"]')?.click();
		await vi.waitFor(() => {
			expect(state.windowActions).toContain('minimize');
			expect(
				document.querySelector<HTMLButtonElement>('[aria-label="Close window"]')?.disabled
			).toBe(false);
		});
		document.querySelector<HTMLButtonElement>('[aria-label="Close window"]')?.click();

		await vi.waitFor(() => {
			expect(state.clipboard).toBe('');
			expect(state.windowActions).toEqual(
				expect.arrayContaining(['startDragging', 'toggleMaximize', 'minimize', 'close'])
			);
			expect(document.querySelector('[data-testid="permission-value"]')?.textContent).toBe(
				'granted'
			);
			expect(document.querySelector('[data-testid="error-value"]')?.textContent).toBe(
				'permission-denied'
			);
		});
	});

	it('renders explicit failures for unsupported desktop capabilities', async () => {
		await render(DesktopBranchFixture, { platform: createUnsupportedDesktopPlatform() });
		document.querySelector<HTMLButtonElement>('[data-testid="directory"]')?.click();
		document.querySelector<HTMLButtonElement>('[data-testid="write"]')?.click();
		document.querySelector<HTMLButtonElement>('[data-testid="permission"]')?.click();
		document.querySelector<HTMLButtonElement>('[aria-label="Minimize window"]')?.click();
		document
			.querySelector<HTMLElement>('[data-tauri-drag-region]')
			?.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 1 }));
		await vi.waitFor(() => {
			expect(document.querySelector('[data-testid="error-value"]')?.textContent).toBe(
				'unsupported'
			);
			expect(document.querySelector('[data-tauri-system-info]')?.textContent).toContain(
				'unavailable'
			);
		});
	});

	it('reports denied notification consent without sending', async () => {
		const { platform, state } = createFakeDesktopDriver({
			notificationPermission: 'denied'
		});
		await render(DesktopBranchFixture, { platform });
		document.querySelector<HTMLButtonElement>('[data-testid="permission"]')?.click();
		await vi.waitFor(() => {
			expect(document.querySelector('[data-testid="permission-value"]')?.textContent).toBe(
				'denied'
			);
		});
		expect(state.notifications).toHaveLength(0);
	});

	it('fails fast when a desktop component has no provider', async () => {
		await expect(render(NoDesktopProvider)).rejects.toThrow(
			'Desktop components must be rendered inside DesktopProvider.'
		);
	});
});
