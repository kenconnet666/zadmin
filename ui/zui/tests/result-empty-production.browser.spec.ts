import { tick } from 'svelte';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';

import ResultEmptyProductionFixture from './ResultEmptyProductionFixture.svelte';

describe('ZResult and ZEmpty production browser contracts', () => {
	it('uses real headings, decorative default icons and Alert-compatible Result tones', () => {
		// @zui-visual ZResult tone and content layout geometry
		render(ResultEmptyProductionFixture);
		for (const tone of ['info', 'success', 'warning', 'danger']) {
			const root = document.querySelector<HTMLElement>(`[data-testid="result-${tone}"]`)!;
			expect(root.dataset.tone).toBe(tone);
			expect(root.querySelector('[data-slot="icon"]')?.getAttribute('aria-hidden')).toBe('true');
			expect(root.querySelector('[data-slot="icon"] svg')?.getAttribute('aria-hidden')).toBe(
				'true'
			);
			expect(root.getAttribute('role')).toBeNull();
		}
		expect(document.querySelector('[data-testid="result-info"] [data-slot="title"]')?.tagName).toBe(
			'H1'
		);
		expect(
			document.querySelector('[data-testid="result-detailed"] [data-slot="title"]')?.tagName
		).toBe('H6');
		expect(document.querySelector('[data-testid="result-no-icon"] [data-slot="icon"]')).toBeNull();
		expect(
			getComputedStyle(
				document.querySelector<HTMLElement>(
					'[data-testid="result-detailed"] [data-slot="content"]'
				)!
			).textAlign
		).toBe('start');
		expect(
			getComputedStyle(
				document.querySelector<HTMLElement>('[data-testid="result-info"] [data-slot="icon"]')!
			).color
		).not.toBe(
			getComputedStyle(
				document.querySelector<HTMLElement>('[data-testid="result-danger"] [data-slot="icon"]')!
			).color
		);
	});

	it('keeps Empty neutral, named by a real heading and independently actionable', () => {
		render(ResultEmptyProductionFixture);
		const defaultEmpty = document.querySelector<HTMLElement>('[data-testid="empty-default"]')!;
		const customEmpty = document.querySelector<HTMLElement>('[data-testid="empty-custom"]')!;
		expect(defaultEmpty.querySelector('[data-slot="title"]')?.tagName).toBe('H2');
		expect(customEmpty.querySelector('[data-slot="title"]')?.tagName).toBe('H5');
		expect(defaultEmpty.querySelector('[data-slot="description"]')?.textContent).toContain(
			'no records'
		);
		expect(defaultEmpty.querySelector('[data-slot="icon"]')?.getAttribute('aria-hidden')).toBe(
			'true'
		);
		expect(document.querySelector('[data-testid="empty-no-icon"] [data-slot="icon"]')).toBeNull();
		expect(defaultEmpty.hasAttribute('data-tone')).toBe(false);
		expect(defaultEmpty.hasAttribute('aria-busy')).toBe(false);
	});

	it('preserves native attributes, wrapped actions and callback ownership', async () => {
		render(ResultEmptyProductionFixture);
		const result = document.querySelector<HTMLElement>('[data-testid="result-detailed"]')!;
		const empty = document.querySelector<HTMLElement>('[data-testid="empty-custom"]')!;
		expect(result.dataset.nativeResult).toBe('true');
		expect(empty.dataset.nativeEmpty).toBe('true');
		expect(
			getComputedStyle(result.querySelector<HTMLElement>('[data-slot="actions"]')!).flexWrap
		).toBe('wrap');
		document.querySelector<HTMLButtonElement>('[data-testid="result-action"]')?.click();
		document.querySelector<HTMLButtonElement>('[data-testid="empty-action"]')?.click();
		await tick();
		expect(
			document.querySelector<HTMLOutputElement>('[data-testid="result-empty-output"]')?.textContent
		).toBe('1:1');
	});
});
