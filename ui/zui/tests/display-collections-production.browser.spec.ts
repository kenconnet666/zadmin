import { tick } from 'svelte';
import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';

import DisplayCollectionsProductionFixture from './DisplayCollectionsProductionFixture.svelte';

describe('ZList and ZDescriptionList production contracts', () => {
	it('keeps ZList typed items, native list semantics and child-owned actions', async () => {
		render(DisplayCollectionsProductionFixture);
		const list = document.querySelector<HTMLElement>('[data-testid="display-list"]')!;
		const ordered = document.querySelector<HTMLOListElement>('[data-testid="display-ordered"]')!;

		expect(list.tagName).toBe('UL');
		expect(list.querySelector(':scope > li')).not.toBeNull();
		expect(list.textContent).toContain('number');
		expect(list.textContent).toContain('string');
		expect(ordered.tagName).toBe('OL');
		expect(ordered.reversed).toBe(true);
		expect(ordered.start).toBe(7);
		expect(ordered.type).toBe('I');

		await userEvent.click(list.querySelector<HTMLButtonElement>('button')!);
		expect(
			document.querySelector('[data-testid="display-collections-output"]')?.textContent?.trim()
		).toBe('1:UL:DL');
	});

	it('keeps ZDescriptionList terms, descriptions, loading/empty status and RTL ownership semantic', async () => {
		render(DisplayCollectionsProductionFixture);
		await tick();
		const descriptions = document.querySelector<HTMLElement>(
			'[data-testid="display-descriptions"]'
		)!;
		const rtl = document.querySelector<HTMLElement>('[data-testid="display-rtl-descriptions"]')!;

		expect(descriptions.tagName).toBe('DL');
		expect(descriptions.querySelector('dt')).not.toBeNull();
		expect(descriptions.querySelector('dd')).not.toBeNull();
		expect(rtl.querySelector('dd')?.textContent).toContain('production-platform');
		expect(getComputedStyle(rtl.querySelector('dd')!).overflowWrap).toBe('anywhere');

		for (const testId of ['display-empty-descriptions', 'display-loading-descriptions']) {
			const root = document.querySelector<HTMLElement>(`[data-testid="${testId}"]`)!;
			expect(root.querySelectorAll('dt, dd')).toHaveLength(0);
			expect(root.nextElementSibling?.getAttribute('data-slot')).toBe('status');
			expect(root.getAttribute('aria-describedby')).toContain(root.nextElementSibling?.id);
		}
	});
});
