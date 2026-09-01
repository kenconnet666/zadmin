import { tick } from 'svelte';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';

import CardProductionFixture from './CardProductionFixture.svelte';

describe('ZCard production contract', () => {
	it('keeps semantic roots, anatomy, actions and loading ownership synchronized', async () => {
		render(CardProductionFixture);
		const neutral = document.querySelector<HTMLElement>('[data-testid="card-production-default"]')!;
		const article = document.querySelector<HTMLElement>('[data-testid="card-production-article"]')!;

		expect(neutral.tagName).toBe('DIV');
		expect(neutral.dataset.variant).toBe('elevated');
		expect(article.tagName).toBe('ARTICLE');
		expect(article.dataset.variant).toBe('outlined');
		expect(article.getAttribute('aria-labelledby')).toBe('card-production-title');
		expect([...article.children].map((child) => (child as HTMLElement).dataset.slot)).toEqual([
			'media',
			'header',
			'body',
			'footer',
			'actions'
		]);

		document.querySelector<HTMLButtonElement>('[data-testid="card-production-action"]')?.click();
		await tick();
		expect(document.querySelector('[data-testid="card-production-output"]')?.textContent).toBe(
			'1:false'
		);

		document.querySelector<HTMLButtonElement>('[data-testid="card-production-loading"]')?.click();
		await tick();
		expect(article.getAttribute('aria-busy')).toBe('true');
		expect(article.dataset.loading).toBe('true');
		expect(article.querySelector('[data-testid="card-production-body"]')).toBeNull();
		expect(article.querySelectorAll('[data-slot="loading"] > [aria-hidden="true"]')).toHaveLength(
			3
		);
		expect(article.querySelector('[data-testid="card-production-media"]')).not.toBeNull();
		expect(article.querySelector('[data-testid="card-production-footer"]')).not.toBeNull();
		expect(article.querySelector('[data-testid="card-production-action"]')).not.toBeNull();
	});
});
