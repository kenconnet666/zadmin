import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import ZSteps, { StepRequestEvent } from '../src/components/navigation/ZSteps.svelte';

describe('ZSteps server and request contract', () => {
	it('keeps ordered native actions, typed current identity and explicit completion', () => {
		const body = render(ZSteps, {
			props: {
				items: [
					{ key: 1, title: 'Completed', status: 'complete' },
					{ key: '1', title: 'Current', clickable: true },
					{ key: 'next', title: 'Route', href: '/next' }
				],
				currentKey: '1',
				'aria-label': 'Setup'
			}
		}).body;
		expect(body).toContain('<ol');
		expect(body.match(/<li\b/gu)).toHaveLength(3);
		expect(body.match(/aria-current="step"/gu)).toHaveLength(1);
		expect(body).toContain('data-key-type="number"');
		expect(body).toContain('data-key-type="string"');
		expect(body).toContain('type="button"');
		expect(body).toContain('href="/next"');
		expect(body).toContain('data-status="complete"');
		expect(body).not.toContain('role="tab');
	});
	it('distinguishes no current item, completed items and an unavailable key without choosing a fallback', () => {
		for (const currentKey of [null, 'not-loaded'] as const) {
			const body = render(ZSteps, {
				props: { currentKey, items: [{ key: 'done', title: 'Done', status: 'complete' }] }
			}).body;
			expect(body).not.toContain('aria-current');
			expect(body).toContain('data-status="complete"');
		}
		const initial = render(ZSteps, {
			props: { defaultCurrentKey: 'first', items: [{ key: 'first', title: 'First' }] }
		}).body;
		expect(initial).toContain('aria-current="step"');
	});
	it.each(
		[
			[
				{ key: 'a', title: 'A' },
				{ key: 'a', title: 'Duplicate' }
			],
			[{ key: Number.NaN, title: 'Invalid' }],
			[{ key: -0, title: 'Invalid' }],
			[{ key: 'a', title: ' ' }],
			[{ key: 'a', title: 'Invalid', status: 'current' }],
			[{ key: 'a', title: 'Invalid', href: '' }],
			[{ key: 'a', title: 'Ambiguous', href: '/route', clickable: true }],
			[{ key: 'a', title: 'Missing link', target: '_blank' }]
		].map((items) => ({ items }))
	)('rejects an ambiguous step descriptor before markup: %j', ({ items }) => {
		expect(() => render(ZSteps, { props: { items: items as never } }).body).toThrow(TypeError);
	});
	it('exposes a cancelable typed request without coupling it to a browser or Promise', () => {
		const item = { key: 'confirm', title: 'Confirm' } as const;
		const original = {} as MouseEvent;
		const request = new StepRequestEvent(item, null, original);
		expect(request.key).toBe('confirm');
		expect(request.previousKey).toBeNull();
		expect(request.originalEvent).toBe(original);
		request.preventDefault();
		expect(request.defaultPrevented).toBe(true);
	});
});
