import { tick } from 'svelte';
import { describe, expect, it, vi } from 'vitest';

import { mount, unmount } from './browser-lifecycle.js';

import MotionRealmFixture from './MotionRealmFixture.svelte';

function mediaQuery(matches: boolean): {
	readonly addEventListener: ReturnType<typeof vi.fn>;
	readonly query: MediaQueryList;
	readonly removeEventListener: ReturnType<typeof vi.fn>;
	set(next: boolean): void;
} {
	let listener: ((event: MediaQueryListEvent) => void) | undefined;
	const addEventListener = vi.fn(
		(_type: string, next: EventListenerOrEventListenerObject): void => {
			listener = next as (event: MediaQueryListEvent) => void;
		}
	);
	const removeEventListener = vi.fn();
	const query = {
		addEventListener,
		dispatchEvent: () => true,
		matches,
		media: '(prefers-reduced-motion: reduce)',
		onchange: null,
		removeEventListener
	} as unknown as MediaQueryList;
	return {
		addEventListener,
		query,
		removeEventListener,
		set(next) {
			Object.defineProperty(query, 'matches', { configurable: true, value: next });
			listener?.({ matches: next } as MediaQueryListEvent);
		}
	};
}

describe('owner realm motion contract', () => {
	it('shares one owner-realm media query and updates CSS, WAAPI and timers together', async () => {
		const frame = document.createElement('iframe');
		document.body.append(frame);
		const ownerDocument = frame.contentDocument!;
		const ownerView = frame.contentWindow!;
		const preference = mediaQuery(true);
		const matchMedia = vi.spyOn(ownerView, 'matchMedia').mockReturnValue(preference.query);

		const component = mount(MotionRealmFixture, {
			props: { motion: 'auto' },
			target: ownerDocument.body
		});
		await tick();

		const contracted = [...ownerDocument.querySelectorAll<HTMLElement>('[data-motion-contract]')];
		expect(contracted.length).toBeGreaterThan(10);
		expect(contracted.every((element) => element.dataset.reducedMotion === 'true')).toBe(true);
		expect(matchMedia).toHaveBeenCalledOnce();
		expect(preference.addEventListener).toHaveBeenCalledOnce();
		expect(
			ownerDocument.querySelector('[data-testid="motion-skeleton"]')?.getAnimations()
		).toHaveLength(0);
		expect(
			ownerDocument.querySelector('[data-testid="motion-progress"] svg')?.getAnimations()
		).toHaveLength(0);

		preference.set(false);
		await tick();
		expect(contracted.every((element) => element.dataset.reducedMotion === undefined)).toBe(true);
		expect(
			ownerDocument.querySelector('[data-testid="motion-skeleton"]')?.getAnimations()
		).toHaveLength(1);
		expect(
			ownerDocument.querySelector('[data-testid="motion-progress"] svg')?.getAnimations()
		).toHaveLength(1);

		preference.set(true);
		await tick();
		expect(
			ownerDocument.querySelector('[data-testid="motion-skeleton"]')?.getAnimations()
		).toHaveLength(0);
		expect(
			ownerDocument.querySelector('[data-testid="motion-progress"] svg')?.getAnimations()
		).toHaveLength(0);

		await unmount(component);
		expect(preference.removeEventListener).toHaveBeenCalledOnce();
		frame.remove();
	});

	it('lets explicit full motion override a reduced owner realm', async () => {
		const preference = mediaQuery(true);
		const matchMedia = vi.spyOn(window, 'matchMedia').mockReturnValue(preference.query);
		const host = document.createElement('div');
		document.body.append(host);
		const component = mount(MotionRealmFixture, {
			props: { motion: 'full' },
			target: host
		});
		await tick();

		expect(
			[...host.querySelectorAll<HTMLElement>('[data-motion-contract]')].every(
				(element) => element.dataset.reducedMotion === undefined
			)
		).toBe(true);
		expect(matchMedia).toHaveBeenCalledOnce();

		await unmount(component);
		expect(preference.removeEventListener).toHaveBeenCalledOnce();
		host.remove();
	});

	it('finishes an active Accordion exit when the Provider changes to reduced', async () => {
		const preference = mediaQuery(false);
		vi.spyOn(window, 'matchMedia').mockReturnValue(preference.query);
		const host = document.createElement('div');
		document.body.append(host);
		const component = mount(MotionRealmFixture, {
			props: { motion: 'full' },
			target: host
		});
		await tick();

		host.querySelector<HTMLButtonElement>('[data-testid="motion-accordion-trigger"]')?.click();
		await tick();
		expect(
			host.querySelector<HTMLElement>('[data-testid="motion-accordion-content"]')?.dataset.presence
		).toBe('exiting');

		host.querySelector<HTMLButtonElement>('[data-testid="motion-force-reduced"]')?.click();
		await tick();
		expect(host.querySelector('[data-testid="motion-accordion-content"]')).toBeNull();

		await unmount(component);
		expect(preference.removeEventListener).toHaveBeenCalledOnce();
		host.remove();
	});
});
