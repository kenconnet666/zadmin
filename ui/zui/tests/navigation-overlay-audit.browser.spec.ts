import { tick } from 'svelte';
import { describe, expect, it, vi } from 'vitest';
import { mount, unmount } from './browser-lifecycle.js';
import NavigationOverlayAuditFixture from './NavigationOverlayAuditFixture.svelte';

function host(): HTMLDivElement {
	const element = document.createElement('div');
	document.body.append(element);
	return element;
}

describe('navigation and overlay visual audit regressions', () => {
	it('dims globally disabled Tree and Command rows once while retaining local disabled styling', async () => {
		const target = host();
		const component = mount(NavigationOverlayAuditFixture, { target, props: { kind: 'disabled' } });
		await tick();
		const roots = ['tree', 'command'].map((name) =>
			target.querySelector<HTMLElement>(`[data-testid="disabled-${name}"]`)!
		);
		for (const root of roots) {
			const rows = root.querySelectorAll<HTMLElement>('[data-slot="item"]');
			expect(getComputedStyle(root).opacity).toBe('1');
			expect(getComputedStyle(rows[0]!).opacity).toBe('1');
			expect(getComputedStyle(rows[1]!).opacity).toBe('0.5');
		}
		component.disableAll();
		await tick();
		for (const root of roots) {
			expect(root.getAttribute('aria-disabled')).toBe('true');
			expect(getComputedStyle(root).opacity).toBe('0.5');
			for (const row of root.querySelectorAll<HTMLElement>('[data-slot="item"]')) {
				expect(getComputedStyle(row).opacity).toBe('1');
				expect(getComputedStyle(row).cursor).toBe('not-allowed');
			}
		}
		await unmount(component);
		target.remove();
	});

	for (const kind of ['accordion', 'dialog', 'popover', 'tooltip'] as const) {
		it(`${kind} paints a closed entry frame, animates in, and retains its exit`, async () => {
			const target = host();
			const component = mount(NavigationOverlayAuditFixture, { target, props: { kind } });
			await tick();
			component.setOpen(true);
			await tick();
			const content = document.querySelector<HTMLElement>('[data-testid="entry-content"]')!;
			expect(getComputedStyle(content).opacity).toBe('0');
			expect(getComputedStyle(content).transitionDuration).toBe('0.4s');
			await vi.waitFor(() => {
				const opacity = Number(getComputedStyle(content).opacity);
				expect(opacity).toBeGreaterThan(0);
				expect(opacity).toBeLessThan(1);
			});
			await vi.waitFor(() => expect(getComputedStyle(content).opacity).toBe('1'));
			if (kind === 'popover' || kind === 'tooltip') {
				expect(getComputedStyle(content).overflowWrap).toBe('anywhere');
				expect(content.scrollWidth).toBeLessThanOrEqual(content.clientWidth + 1);
				expect(content.getBoundingClientRect().width).toBeLessThanOrEqual(
					document.documentElement.clientWidth
				);
			}
			component.setOpen(false);
			await tick();
			expect(content.dataset.presence).toBe('exiting');
			expect(content.isConnected).toBe(true);
			await vi.waitFor(() => expect(content.isConnected).toBe(false));
			await unmount(component);
			target.remove();
		});

		it(`${kind} keeps initially open content visible and reduced motion synchronous`, async () => {
			const target = host();
			const component = mount(NavigationOverlayAuditFixture, {
				target,
				props: { kind, initiallyOpen: true, motion: 'reduced' }
			});
			await tick();
			let content = document.querySelector<HTMLElement>('[data-testid="entry-content"]')!;
			expect(getComputedStyle(content).opacity).toBe('1');
			expect(getComputedStyle(content).transitionDuration).toBe('0s');
			component.setOpen(false);
			await tick();
			expect(content.isConnected).toBe(false);
			component.setOpen(true);
			await tick();
			content = document.querySelector<HTMLElement>('[data-testid="entry-content"]')!;
			expect(getComputedStyle(content).opacity).toBe('1');
			await unmount(component);
			target.remove();
		});
	}
});
