import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import CardProductionFixture from './CardProductionFixture.svelte';
import ZCard from '../src/components/data-display/ZCard.svelte';

describe('ZCard server contract', () => {
	it('defaults to a neutral div and preserves caller native attributes', () => {
		const body = render(ZCard, {
			props: { 'aria-label': 'Metrics', 'data-testid': 'card', variant: 'outlined' }
		}).body;

		expect(body).toMatch(
			/<div(?=[^>]*aria-label="Metrics")(?=[^>]*data-variant="outlined")[^>]*>/u
		);
		expect(body).not.toContain('<article');
	});

	it('renders the complete semantic anatomy in deterministic order', () => {
		const body = render(CardProductionFixture).body;
		const articleStart = body.indexOf('<article');
		const articleEnd = body.indexOf('</article>', articleStart);
		const article = body.slice(articleStart, articleEnd);
		const media = article.indexOf('data-slot="media"');
		const header = article.indexOf('data-slot="header"');
		const cardBody = article.indexOf('data-slot="body"');
		const footer = article.indexOf('data-slot="footer"');
		const actions = article.indexOf('data-slot="actions"');

		expect(body).toMatch(/<article(?=[^>]*aria-labelledby="card-production-title")[^>]*>/u);
		expect(media).toBeGreaterThan(-1);
		expect(media).toBeLessThan(header);
		expect(header).toBeLessThan(cardBody);
		expect(cardBody).toBeLessThan(footer);
		expect(footer).toBeLessThan(actions);
	});

	it('keeps caller aria-busy unless loading owns the busy state', () => {
		expect(render(ZCard, { props: { 'aria-busy': 'false' } }).body).toContain('aria-busy="false"');
		expect(render(ZCard, { props: { 'aria-busy': 'false', loading: true } }).body).toContain(
			'aria-busy="true"'
		);
	});
});
