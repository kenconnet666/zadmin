import { tick } from 'svelte';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';

import FeedbackStatusProductionFixture from './FeedbackStatusProductionFixture.svelte';

const wait = (duration: number): Promise<void> =>
	new Promise((resolve) => window.setTimeout(resolve, duration));

describe('Alert, Spinner and LoadingBar production browser contracts', () => {
	it('keeps Alert live priority, semantic icons, actions and dismiss ownership explicit', async () => {
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

	it('uses finite Spinner tones, suppresses nested status semantics and cleans reduced motion', () => {
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

	it('keeps LoadingBar determinate, indeterminate, page, error and reduced states distinct', () => {
		render(FeedbackStatusProductionFixture);
		const determinate = document.querySelector<HTMLElement>('[data-testid="loading-determinate"]')!;
		const indeterminate = document.querySelector<HTMLElement>(
			'[data-testid="loading-indeterminate"]'
		)!;
		const reduced = document.querySelector<HTMLElement>('[data-testid="loading-reduced"]')!;
		expect(determinate.getAttribute('aria-valuenow')).toBe('42');
		expect(determinate.hasAttribute('aria-valuetext')).toBe(false);
		expect(indeterminate.hasAttribute('aria-valuenow')).toBe(false);
		expect(indeterminate.getAttribute('aria-valuetext')).toBe('Connecting');
		expect(document.querySelector<HTMLElement>('[data-testid="loading-page"]')?.dataset.mode).toBe(
			'page'
		);
		expect(
			document.querySelector<HTMLElement>('[data-testid="loading-error"]')?.dataset.state
		).toBe('error');
		expect(reduced.dataset.reducedMotion).toBe('true');
		expect(reduced.querySelector<HTMLElement>('[data-slot="indicator"]')?.style.width).toBe('100%');
		expect(
			reduced.querySelector<HTMLElement>('[data-slot="indicator"]')?.getAnimations()
		).toHaveLength(0);
	});

	it('runs a scoped controller lifecycle and clears the owner Window finish timer', async () => {
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
});
