import { tick } from 'svelte';
import { describe, expect, it, vi } from 'vitest';

import { mount, unmount } from './browser-lifecycle.js';

import DrawerFixture from './DrawerFixture.svelte';
import NestedDrawerFixture from './NestedDrawerFixture.svelte';

function target(): HTMLDivElement {
	const element = document.createElement('div');
	document.body.append(element);
	return element;
}

describe('ZDrawer compound production contracts', () => {
	it('ZDrawerContent, ZDrawerOverlay, ZDrawerTitle and ZDrawerDescription paint and register semantic states', async () => {
		// @zui-visual ZDrawerTrigger
		// @zui-visual ZDrawerOverlay
		// @zui-visual ZDrawerContent
		// @zui-visual ZDrawerTitle
		// @zui-visual ZDrawerDescription
		// @zui-visual ZDrawerClose
		const host = target();
		const component = mount(DrawerFixture, {
			props: { motion: 'full', placement: 'start', size: 'small' },
			target: host
		});
		host.querySelector<HTMLButtonElement>('[data-testid="drawer-trigger"]')?.click();
		await tick();
		expect(
			host
				.querySelector<HTMLButtonElement>('[data-testid="drawer-trigger"]')
				?.getAttribute('aria-expanded')
		).toBe('true');
		const content = document.querySelector<HTMLElement>('[data-testid="drawer-content"]');
		const overlay = document.querySelector<HTMLElement>('[data-testid="drawer-overlay"]');
		expect(content?.dataset.motionState).toBe('entering');
		expect(content?.getAttribute('role')).toBe('dialog');
		expect(content?.getAttribute('aria-modal')).toBe('true');
		expect(content?.dataset.placement).toBe('start');
		expect(content?.dataset.size).toBe('small');
		expect(overlay?.dataset.motionState).toBe('entering');
		expect(overlay).not.toBeNull();
		await new Promise<void>((resolve) => {
			requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
		});
		await tick();
		expect(content?.dataset.motionState).toBe('entered');
		expect(overlay?.dataset.motionState).toBe('entered');
		expect(getComputedStyle(overlay!).position).toBe('fixed');
		expect(getComputedStyle(overlay!).inset).toMatch(/0px/u);
		expect(getComputedStyle(content!).position).toBe('fixed');
		expect(content!.getBoundingClientRect().width).toBeGreaterThan(0);
		const labelledBy = content?.getAttribute('aria-labelledby');
		const describedBy = content?.getAttribute('aria-describedby');
		const trigger = host.querySelector<HTMLButtonElement>('[data-testid="drawer-trigger"]')!;
		const close = document.querySelector<HTMLButtonElement>('[data-testid="drawer-close"]')!;
		const title = content?.ownerDocument.getElementById(labelledBy ?? '')!;
		const description = content?.ownerDocument.getElementById(describedBy ?? '')!;
		expect(
			trigger.getBoundingClientRect().height,
			'drawer trigger has button geometry'
		).toBeGreaterThan(0);
		expect(
			close.getBoundingClientRect().height,
			'drawer close has button geometry'
		).toBeGreaterThan(0);
		expect(
			title.getBoundingClientRect().height,
			'drawer title has typography geometry'
		).toBeGreaterThan(0);
		expect(getComputedStyle(title).fontSize).toBe('18px');
		expect(getComputedStyle(title).fontWeight).toBe('700');
		expect(
			description.getBoundingClientRect().height,
			'drawer description has typography geometry'
		).toBeGreaterThan(0);
		expect(getComputedStyle(description).marginBlockStart).toBe('8px');
		expect(content?.ownerDocument.getElementById(labelledBy ?? '')?.textContent).toBe(
			'Fixture drawer'
		);
		expect(content?.ownerDocument.getElementById(describedBy ?? '')?.textContent).toBe(
			'Fixture drawer description'
		);
		await unmount(component);
		host.remove();
	});

	it('ZDrawerContent resolves all physical edges from logical placements and RTL direction', async () => {
		// @zui-visual ZDrawer
		const host = target();
		const cases = [
			{ direction: 'ltr', edge: 'left', placement: 'start' },
			{ direction: 'rtl', edge: 'right', placement: 'start' },
			{ direction: 'ltr', edge: 'right', placement: 'end' },
			{ direction: 'rtl', edge: 'left', placement: 'end' },
			{ direction: 'ltr', edge: 'top', placement: 'top' },
			{ direction: 'ltr', edge: 'bottom', placement: 'bottom' }
		] as const;
		for (const props of cases) {
			const component = mount(DrawerFixture, {
				props: { ...props, defaultOpen: true, motion: 'reduced' },
				target: host
			});
			await tick();
			const content = document.querySelector<HTMLElement>('[data-testid="drawer-content"]');
			expect(getComputedStyle(content!).getPropertyValue(props.edge)).toBe('0px');
			await unmount(component);
		}
		host.remove();
	});

	it('ZDrawerContent supports custom CSS sizes, full viewport mode and reduced-motion cleanup', async () => {
		// @zui-visual ZDrawer
		const host = target();
		const component = mount(DrawerFixture, {
			props: {
				defaultOpen: true,
				motion: 'reduced',
				size: 'min(32rem, calc(100vw - 2rem))'
			},
			target: host
		});
		await tick();
		const content = document.querySelector<HTMLElement>('[data-testid="drawer-content"]');
		const expectedWidth = Math.min(512, innerWidth - 32, innerWidth * 0.9);
		expect(content?.getBoundingClientRect().width).toBeCloseTo(expectedWidth, 0);
		expect(content?.dataset.reducedMotion).toBe('true');
		document.querySelector<HTMLButtonElement>('[data-testid="drawer-close"]')?.click();
		await tick();
		expect(document.querySelector('[data-testid="drawer-content"]')).toBeNull();
		await unmount(component);

		const full = mount(DrawerFixture, {
			props: { defaultOpen: true, motion: 'reduced', placement: 'top', size: 'full' },
			target: host
		});
		await tick();
		const fullContent = document.querySelector<HTMLElement>('[data-testid="drawer-content"]');
		expect(fullContent?.getBoundingClientRect().height).toBeCloseTo(innerHeight, 0);
		await unmount(full);
		host.remove();
	});

	it('ZDrawer resolves auto motion at the owner while full motion overrides system reduction', async () => {
		const removeEventListener = vi.fn();
		const addEventListener = vi.fn();
		const matchMedia = vi.spyOn(window, 'matchMedia').mockReturnValue({
			addEventListener,
			addListener: vi.fn(),
			dispatchEvent: () => true,
			matches: true,
			media: '(prefers-reduced-motion: reduce)',
			onchange: null,
			removeEventListener,
			removeListener: vi.fn()
		} as MediaQueryList);
		const host = target();
		const automatic = mount(DrawerFixture, {
			props: { defaultOpen: true, motion: 'auto' },
			target: host
		});
		await tick();
		expect(
			document.querySelector<HTMLElement>('[data-testid="drawer-content"]')?.dataset.reducedMotion
		).toBe('true');
		await unmount(automatic);
		expect(removeEventListener).toHaveBeenCalledOnce();

		const full = mount(DrawerFixture, {
			props: { defaultOpen: true, motion: 'full' },
			target: host
		});
		await tick();
		expect(
			document.querySelector<HTMLElement>('[data-testid="drawer-content"]')?.dataset.reducedMotion
		).toBeUndefined();
		await unmount(full);
		host.remove();
		matchMedia.mockRestore();
	});

	it('ZDrawerContent and ZDrawerOverlay portal into a ShadowRoot and scope modal lifecycle to the owner', async () => {
		const originalOverflow = document.body.style.overflow;
		const host = target();
		const portalHost = document.createElement('div');
		document.body.append(portalHost);
		const shadow = portalHost.attachShadow({ mode: 'open' });
		const component = mount(DrawerFixture, {
			props: { defaultOpen: true, motion: 'reduced', portalContainer: shadow },
			target: host
		});
		await tick();
		const content = shadow.querySelector<HTMLElement>('[data-testid="drawer-content"]');
		expect(content?.parentNode).toBe(shadow);
		expect(shadow.querySelector('[data-testid="drawer-overlay"]')?.parentNode).toBe(shadow);
		expect(document.body.style.overflow).toBe('hidden');
		await unmount(component);
		expect(document.body.style.overflow).toBe(originalOverflow);
		host.remove();
		portalHost.remove();
	});

	it('ZDrawerClose cancels ZDrawerContent Presence exit in the portalled owner Window', async () => {
		const frame = document.createElement('iframe');
		document.body.append(frame);
		const ownerWindow = frame.contentWindow;
		const ownerDocument = frame.contentDocument;
		if (!ownerWindow || !ownerDocument)
			throw new Error('Fixture iframe did not expose a DOM realm.');
		const host = ownerDocument.createElement('div');
		ownerDocument.body.append(host);
		const component = mount(DrawerFixture, {
			props: {
				defaultOpen: true,
				motion: 'full',
				portalContainer: ownerDocument
			},
			target: host
		});
		let mounted = true;
		try {
			await tick();
			ownerDocument.querySelector<HTMLButtonElement>('[data-testid="drawer-close"]')?.click();
			await tick();
			expect(ownerDocument.querySelector('[data-testid="drawer-content"]')).not.toBeNull();
			await new Promise((resolve) => ownerWindow.setTimeout(resolve, 20));
			// Unmount cancels both owner-window exit timers before their 200ms deadline.
			await unmount(component);
			mounted = false;
			expect(ownerDocument.querySelector('[data-testid="drawer-content"]')).toBeNull();
		} finally {
			if (mounted) await unmount(component);
			frame.remove();
		}
	});

	it('ZDrawerTrigger and ZDrawerClose restore focus and scroll lock one nested layer at a time', async () => {
		const originalOverflow = document.body.style.overflow;
		const host = target();
		const component = mount(NestedDrawerFixture, { target: host });
		const outerTrigger = host.querySelector<HTMLButtonElement>('[data-testid="outer-trigger"]');
		outerTrigger?.focus();
		outerTrigger?.click();
		await tick();
		const innerTrigger = document.querySelector<HTMLButtonElement>('[data-testid="inner-trigger"]');
		innerTrigger?.click();
		await tick();
		expect(document.activeElement?.getAttribute('aria-label')).toBe('Inner drawer input');
		expect(document.body.style.overflow).toBe('hidden');

		document.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Escape' }));
		await tick();
		expect(document.querySelector('[data-testid="inner-content"]')).toBeNull();
		expect(document.querySelector('[data-testid="outer-content"]')).not.toBeNull();
		expect(document.activeElement).toBe(innerTrigger);
		expect(document.body.style.overflow).toBe('hidden');

		document.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Escape' }));
		await tick();
		expect(document.querySelector('[data-testid="outer-content"]')).toBeNull();
		expect(document.activeElement).toBe(outerTrigger);
		expect(document.body.style.overflow).toBe(originalOverflow);
		await unmount(component);
		host.remove();
	});

	it('ZDrawerOverlay and ZDrawerClose separate default outside/Escape dismiss from explicit-only workflows', async () => {
		const host = target();
		const standard = mount(DrawerFixture, {
			props: { defaultOpen: true, motion: 'reduced' },
			target: host
		});
		await tick();
		document
			.querySelector<HTMLElement>('[data-testid="drawer-overlay"]')
			?.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
		await tick();
		expect(document.querySelector('[data-testid="drawer-content"]')).toBeNull();
		await unmount(standard);

		const explicit = mount(DrawerFixture, {
			props: {
				defaultOpen: true,
				dismissOnEscape: false,
				dismissOnPointerOutside: false,
				motion: 'reduced'
			},
			target: host
		});
		await tick();
		document.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Escape' }));
		document
			.querySelector<HTMLElement>('[data-testid="drawer-overlay"]')
			?.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
		await tick();
		expect(document.querySelector('[data-testid="drawer-content"]')).not.toBeNull();
		document.querySelector<HTMLButtonElement>('[data-testid="drawer-close"]')?.click();
		await tick();
		expect(document.querySelector('[data-testid="drawer-content"]')).toBeNull();
		await unmount(explicit);
		host.remove();
	});
});
