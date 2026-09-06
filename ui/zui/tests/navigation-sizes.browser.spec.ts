import { tick } from 'svelte';
import { describe, expect, it, vi } from 'vitest';
import { mount, unmount } from './browser-lifecycle.js';
import NavigationSizesFixture from './NavigationSizesFixture.svelte';
import TabsOverflowFixture from './TabsOverflowFixture.svelte';

const scales = [
	['xsmall', 24, 11, 320, 256],
	['small', 28, 12, 400, 320],
	['medium', 32, 14, 512, 400],
	['large', 40, 16, 640, 560],
	['xlarge', 48, 16, 768, 720]
] as const;

function target(): HTMLDivElement {
	const element = document.createElement('div');
	document.body.append(element);
	return element;
}

describe('navigation and overlay five-size geometry', () => {
	for (const orientation of ['horizontal', 'vertical'] as const) {
		it(`contains ${orientation} long Tabs labels inside nested grid and Stack layouts`, async () => {
			const host = target();
			const component = mount(TabsOverflowFixture, {
				target: host,
				props: { size: 'xlarge', orientation }
			});
			await tick();
			const boundary = host.querySelector<HTMLElement>('[data-testid="tabs-boundary"]')!;
			const tabs = host.querySelector<HTMLElement>('[data-testid="bounded-tabs"]')!;
			const list = host.querySelector<HTMLElement>('[role="tablist"]')!;
			expect(boundary.scrollWidth).toBeLessThanOrEqual(boundary.clientWidth + 1);
			expect(tabs.getBoundingClientRect().width).toBeLessThanOrEqual(280);
			expect(list.getBoundingClientRect().width).toBeLessThanOrEqual(280);
			if (orientation === 'horizontal') {
				expect(list.scrollWidth).toBeGreaterThan(list.clientWidth);
				expect(getComputedStyle(list).overflowX).toBe('auto');
			} else expect(list.scrollWidth).toBeLessThanOrEqual(list.clientWidth + 1);
			await unmount(component);
			host.remove();
		});
	}

	for (const [size, height, fontSize, dialogWidth, drawerWidth] of scales) {
		it(`${size} reaches real collection rows and native pagination controls`, async () => {
			const host = target();
			const component = mount(NavigationSizesFixture, { target: host, props: { size } });
			await tick();
			for (const selector of [
				'[data-testid="size-accordion"]',
				'[data-testid="size-tab"]',
				'[data-testid="size-menu"]',
				'[data-testid="size-pagination"] button',
				'[data-testid="size-pagination"] select',
				'[data-testid="size-pagination-simple"] input',
				'[data-testid="size-command"] input',
				'[data-testid="size-command"] [data-slot="item"]',
				'[data-testid="size-tree"] [data-slot="item"]',
				'[data-testid="size-virtual-tree"] [data-slot="item"]'
			]) {
				const element = host.querySelector<HTMLElement>(selector)!;
				expect(element, selector).not.toBeNull();
				expect(element.getBoundingClientRect().height, selector).toBeCloseTo(height, 0);
				expect(getComputedStyle(element).fontSize, selector).toBe(`${fontSize}px`);
			}
			await unmount(component);
			host.remove();
		});

		for (const [kind, width] of [
			['dialog', dialogWidth],
			['drawer', drawerWidth]
		] as const) {
			it(`${size} ${kind} consumes its dedicated panel width`, async () => {
				const host = target();
				const component = mount(NavigationSizesFixture, { target: host, props: { size, kind } });
				await tick();
				const panel = document.querySelector<HTMLElement>('[data-testid="size-panel"]')!;
				expect(panel.getBoundingClientRect().width).toBeCloseTo(
					Math.min(width, window.innerWidth * 0.9),
					0
				);
				await unmount(component);
				host.remove();
			});
		}
	}

	it('resolves CSS theme row heights to pixels and retains explicit virtual itemSize ownership', async () => {
		for (const itemSize of [undefined, 31]) {
			const host = target();
			const component = mount(NavigationSizesFixture, {
				target: host,
				props: { customHeight: true, itemSize }
			});
			await tick();
			const row = host.querySelector<HTMLElement>(
				'[data-testid="size-virtual-tree"] [data-slot="item"]'
			)!;
			const expected =
				itemSize ?? Number.parseFloat(getComputedStyle(document.documentElement).fontSize) * 2.75;
			expect(row.getBoundingClientRect().height).toBeCloseTo(expected, 0);
			await unmount(component);
			host.remove();
		}
	});

	it('tracks inherited CSS variable row heights without replacing the theme and disconnects on unmount', async () => {
		const host = target();
		host.style.setProperty('--tree-row-height', '38px');
		const component = mount(NavigationSizesFixture, {
			target: host,
			props: { cssVariableHeight: true }
		});
		await tick();
		const virtualRow = host.querySelector<HTMLElement>(
			'[data-testid="size-virtual-tree"] [data-slot="item"]'
		)!;
		const normalRow = host.querySelector<HTMLElement>(
			'[data-testid="size-tree"] [data-slot="item"]'
		)!;
		expect(virtualRow.getBoundingClientRect().height).toBeCloseTo(38, 0);
		host.style.setProperty('--tree-row-height', '52px');
		await vi.waitFor(() => {
			expect(normalRow.getBoundingClientRect().height).toBeCloseTo(52, 0);
			expect(virtualRow.getBoundingClientRect().height).toBeCloseTo(52, 0);
		});
		await unmount(component);
		expect(host.querySelectorAll('*')).toHaveLength(0);
		host.remove();
	});

	it('uses inverse Tooltip tokens and a themed maximum width for long words', async () => {
		const host = target();
		const component = mount(NavigationSizesFixture, { target: host, props: { kind: 'tooltip' } });
		await tick();
		const content = document.querySelector<HTMLElement>('[data-testid="size-tooltip"]')!;
		await vi.waitFor(() => expect(content.getBoundingClientRect().width).toBeCloseTo(180, 0));
		expect(getComputedStyle(content).backgroundColor).toBe('rgb(18, 52, 86)');
		expect(getComputedStyle(content).color).toBe('rgb(240, 240, 240)');
		expect(content.scrollWidth).toBeLessThanOrEqual(content.clientWidth + 1);
		await unmount(component);
		host.remove();
	});

	it('passes Palette external results, custom filtering, maxResults, loop and result announcements to Command', async () => {
		for (const externalResults of [true, false]) {
			const host = target();
			const component = mount(NavigationSizesFixture, {
				target: host,
				props: { kind: 'palette', externalResults }
			});
			await tick();
			const command = document.querySelector<HTMLElement>('[data-slot="command"]')!;
			const expected = externalResults ? 2 : 1;
			expect(command.querySelectorAll('[role="option"]')).toHaveLength(expected);
			expect(command.querySelector('[data-slot="status"]')?.textContent).toContain(
				`Custom results: ${expected}`
			);
			const input = command.querySelector<HTMLInputElement>('input')!;
			input.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
			await tick();
			const last = input.getAttribute('aria-activedescendant');
			input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
			await tick();
			expect(input.getAttribute('aria-activedescendant')).toBe(last);
			await unmount(component);
			host.remove();
		}
	});
});
