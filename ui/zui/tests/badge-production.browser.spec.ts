import { tick } from 'svelte';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';

import BadgeProductionFixture from './BadgeProductionFixture.svelte';

describe('ZBadge production contract', () => {
	it('preserves exact counts, logical placement, dot semantics and motion ownership', async () => {
		render(BadgeProductionFixture);
		const anchor = document.querySelector<HTMLElement>('[data-testid="badge-production-anchor"]')!;
		const indicator = anchor.querySelector<HTMLElement>('[data-slot="indicator"]')!;
		const reduced = document.querySelector<HTMLElement>(
			'[data-testid="badge-production-reduced"] [data-slot="indicator"]'
		)!;

		expect(indicator.querySelector('[data-slot="count"]')?.textContent).toBe('99+');
		expect(indicator.querySelector('[data-slot="accessible-count"]')?.textContent).toBe('100');
		expect(indicator.style.transform).toContain('translate(calc(-35%');
		expect(
			document.querySelector('[data-testid="badge-production-zero-hidden"] [data-slot="indicator"]')
		).toBeNull();
		expect(
			document.querySelector(
				'[data-testid="badge-production-zero-visible"] [data-slot="indicator"]'
			)
		).not.toBeNull();
		expect(
			document
				.querySelector('[data-testid="badge-production-dot-decorative"] [data-slot="indicator"]')
				?.getAttribute('aria-hidden')
		).toBe('true');
		expect(
			document
				.querySelector('[data-testid="badge-production-dot-named"] [data-slot="indicator"]')
				?.querySelector('[data-slot="accessible-count"]')?.textContent
		).toBe('服务在线');

		document
			.querySelector<HTMLButtonElement>('[data-testid="badge-production-increment"]')
			?.click();
		await tick();
		expect(indicator.querySelector('[data-slot="accessible-count"]')?.textContent).toBe('101');
		expect(indicator.getAnimations()).toHaveLength(1);
		expect(reduced.getAnimations()).toHaveLength(0);

		document
			.querySelector<HTMLButtonElement>('[data-testid="badge-production-toggle-direction"]')
			?.click();
		await tick();
		expect(indicator.style.transform).toContain('translate(calc(35%');

		document
			.querySelector<HTMLButtonElement>('[data-testid="badge-production-toggle-visible"]')
			?.click();
		await tick();
		expect(anchor.dataset.invisible).toBe('true');
		expect(anchor.querySelector('[data-slot="indicator"]')).toBeNull();
		expect(indicator.getAnimations()).toHaveLength(0);
	});
});
