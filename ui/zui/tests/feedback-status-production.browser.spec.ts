import { tick } from 'svelte';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';

import { mount, unmount } from './browser-lifecycle.js';
import FeedbackStatusProductionFixture from './FeedbackStatusProductionFixture.svelte';

const wait = (duration: number): Promise<void> =>
	new Promise((resolve) => window.setTimeout(resolve, duration));

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

describe('Alert, Spinner and LoadingBar production browser contracts', () => {
	it('ZAlert keeps live priority, semantic icons, actions and dismiss ownership explicit', async () => {
		render(FeedbackStatusProductionFixture);
		const off = document.querySelector<HTMLElement>('[data-testid="alert-off"]')!;
		const polite = document.querySelector<HTMLElement>('[data-testid="alert-polite"]')!;
		const assertive = document.querySelector<HTMLElement>('[data-testid="alert-assertive"]')!;
		expect(off.getAttribute('role')).toBeNull();
		expect(off.querySelector('[data-slot="icon"]')).toBeNull();
		expect(polite.getAttribute('role')).toBe('status');
		expect(polite.querySelector('[data-slot="icon"]')?.getAttribute('aria-hidden')).toBe('true');
		expect(polite.querySelector('[data-slot="icon"] svg')?.getAttribute('aria-hidden')).toBe(
			'true'
		);
		expect(assertive.getAttribute('role')).toBe('alert');
		expect(document.querySelector('[data-testid="alert-action"]')).not.toBeNull();

		document.querySelector<HTMLButtonElement>('[aria-label="Dismiss deployment warning"]')?.click();
		await tick();
		expect(document.querySelector('[data-testid="alert-dismissible"]')).toBeNull();
		expect(document.querySelector('[data-testid="alert-output"]')?.textContent).toBe('dismissed');
	});

	it('ZSpinner uses finite tones, suppresses nested status semantics and cleans reduced motion', () => {
		render(FeedbackStatusProductionFixture);
		const primary = document.querySelector<HTMLElement>('[data-testid="spinner-primary"]')!;
		const hidden = document.querySelector<HTMLElement>('[data-testid="spinner-hidden"]')!;
		const reduced = document.querySelector<HTMLElement>('[data-testid="spinner-reduced"]')!;
		expect(primary.getAttribute('role')).toBe('status');
		expect(primary.getAttribute('aria-label')).toBe('Synchronizing');
		expect(primary.dataset.tone).toBe('primary');
		expect(primary.querySelector('svg')?.classList.contains('lucide-loader-circle')).toBe(true);
		expect(primary.querySelector<SVGSVGElement>('svg')?.getAnimations()).toHaveLength(1);
		expect(hidden.getAttribute('aria-hidden')).toBe('true');
		expect(hidden.getAttribute('role')).toBeNull();
		expect(hidden.getAttribute('aria-label')).toBeNull();
		expect(reduced.dataset.reducedMotion).toBe('true');
		expect(reduced.querySelector<SVGSVGElement>('svg')?.getAnimations()).toHaveLength(0);
	});

	it('ZLoadingBar keeps determinate, indeterminate, page, error and reduced states distinct', () => {
		// @zui-visual ZLoadingBar mode, state and indicator geometry
		render(FeedbackStatusProductionFixture);
		const determinate = document.querySelector<HTMLElement>('[data-testid="loading-determinate"]')!;
		const indeterminate = document.querySelector<HTMLElement>(
			'[data-testid="loading-indeterminate"]'
		)!;
		const reduced = document.querySelector<HTMLElement>('[data-testid="loading-reduced"]')!;
		const page = document.querySelector<HTMLElement>('[data-testid="loading-page"]')!;
		const error = document.querySelector<HTMLElement>('[data-testid="loading-error"]')!;
		expect(determinate.getAttribute('aria-valuenow')).toBe('42');
		expect(determinate.hasAttribute('aria-valuetext')).toBe(false);
		expect(indeterminate.hasAttribute('aria-valuenow')).toBe(false);
		expect(indeterminate.getAttribute('aria-valuetext')).toBe('Connecting');
		expect(page.dataset.mode).toBe('page');
		expect(error.dataset.state).toBe('error');
		expect(determinate.getBoundingClientRect().height).toBe(3);
		expect(getComputedStyle(page).position).toBe('fixed');
		expect(
			getComputedStyle(error.querySelector<HTMLElement>('[data-slot="indicator"]')!).backgroundColor
		).not.toBe(
			getComputedStyle(determinate.querySelector<HTMLElement>('[data-slot="indicator"]')!)
				.backgroundColor
		);
		expect(reduced.dataset.reducedMotion).toBe('true');
		expect(reduced.querySelector<HTMLElement>('[data-slot="indicator"]')?.style.width).toBe('100%');
		expect(
			reduced.querySelector<HTMLElement>('[data-slot="indicator"]')?.getAnimations()
		).toHaveLength(0);
	});

	it('ZLoadingBar runs a scoped controller lifecycle and clears the owner Window finish timer', async () => {
		render(FeedbackStatusProductionFixture);
		const bar = document.querySelector<HTMLElement>('[data-testid="loading-controller"]')!;
		document.querySelector<HTMLButtonElement>('[data-testid="loading-start"]')?.click();
		await tick();
		expect(bar.hidden).toBe(false);
		expect(bar.dataset.state).toBe('loading');
		expect(bar.hasAttribute('aria-valuenow')).toBe(false);

		document.querySelector<HTMLButtonElement>('[data-testid="loading-update"]')?.click();
		await tick();
		expect(bar.getAttribute('aria-valuenow')).toBe('48');
		expect(document.querySelector('[data-testid="loading-output"]')?.textContent).toBe(
			'true:loading:48'
		);

		document.querySelector<HTMLButtonElement>('[data-testid="loading-error-action"]')?.click();
		await tick();
		expect(bar.dataset.state).toBe('error');
		expect(bar.hidden).toBe(false);

		document.querySelector<HTMLButtonElement>('[data-testid="loading-finish"]')?.click();
		await tick();
		expect(bar.dataset.state).toBe('success');
		expect(bar.getAttribute('aria-valuenow')).toBe('100');
		await wait(30);
		await tick();
		expect(bar.hidden).toBe(true);
		expect(document.querySelector('[data-testid="loading-output"]')?.textContent).toBe(
			'false:success:100'
		);
	});

	it('ZSpinner follows owner-realm system reduced motion and rebuilds WAAPI after restoration', async () => {
		const frame = document.createElement('iframe');
		document.body.append(frame);
		const ownerDocument = frame.contentDocument!;
		const ownerView = frame.contentWindow!;
		const preference = mediaQuery(false);
		const matchMedia = vi.spyOn(ownerView, 'matchMedia').mockReturnValue(preference.query);
		const component = mount(FeedbackStatusProductionFixture, { target: ownerDocument.body });
		await tick();

		const spinner = ownerDocument.querySelector<HTMLElement>('[data-testid="spinner-primary"]')!;
		const indicator = spinner.querySelector<SVGSVGElement>('svg')!;
		expect(matchMedia).toHaveBeenCalledOnce();
		expect(indicator.getAnimations()).toHaveLength(1);

		preference.set(true);
		await tick();
		expect(spinner.dataset.reducedMotion).toBe('true');
		expect(indicator.getAnimations()).toHaveLength(0);

		preference.set(false);
		await tick();
		expect(spinner.dataset.reducedMotion).toBeUndefined();
		expect(indicator.getAnimations()).toHaveLength(1);

		await unmount(component);
		expect(preference.removeEventListener).toHaveBeenCalledOnce();
		frame.remove();
	});

	it('ZLoadingBar pauses owner-document indeterminate WAAPI while hidden and resumes when visible', async () => {
		const frame = document.createElement('iframe');
		document.body.append(frame);
		const ownerDocument = frame.contentDocument!;
		const preference = mediaQuery(false);
		const matchMedia = vi
			.spyOn(frame.contentWindow!, 'matchMedia')
			.mockReturnValue(preference.query);
		const component = mount(FeedbackStatusProductionFixture, { target: ownerDocument.body });
		await tick();

		const bar = ownerDocument.querySelector<HTMLElement>('[data-testid="loading-indeterminate"]')!;
		const indicator = bar.querySelector<HTMLElement>('[data-slot="indicator"]')!;
		expect(matchMedia).toHaveBeenCalled();
		expect(bar.dataset.documentVisible).toBe('true');
		expect(indicator.getAnimations()).toHaveLength(1);

		Object.defineProperty(ownerDocument, 'visibilityState', {
			configurable: true,
			value: 'hidden'
		});
		ownerDocument.dispatchEvent(new Event('visibilitychange'));
		await tick();
		expect(bar.dataset.documentVisible).toBe('false');
		expect(indicator.getAnimations()).toHaveLength(0);

		Object.defineProperty(ownerDocument, 'visibilityState', {
			configurable: true,
			value: 'visible'
		});
		ownerDocument.dispatchEvent(new Event('visibilitychange'));
		await tick();
		expect(bar.dataset.documentVisible).toBe('true');
		expect(indicator.getAnimations()).toHaveLength(1);

		await unmount(component);
		expect(ownerDocument.body.childElementCount).toBe(0);
		frame.remove();
	});
});
