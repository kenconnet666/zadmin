import { render } from 'svelte/server';
import { createRawSnippet } from 'svelte';
import { describe, expect, it } from 'vitest';

import ZBadge from '../src/components/data-display/ZBadge.svelte';

describe('ZBadge server contract', () => {
	it('keeps the exact count accessible while max only changes visual text', () => {
		const body = render(ZBadge, { props: { count: 128, max: 99, tone: 'danger' } }).body;
		expect(body).toContain('data-slot="indicator"');
		expect(body).toContain('data-slot="accessible-count"');
		expect(body).toContain('128');
		expect(body).toContain('data-slot="count"');
		expect(body).toContain('99+');
	});

	it('distinguishes hidden zero, explicit zero and decorative dot', () => {
		expect(render(ZBadge, { props: { count: 0 } }).body).not.toContain('data-slot="indicator"');
		expect(render(ZBadge, { props: { count: 0, showZero: true } }).body).toContain(
			'data-slot="indicator"'
		);
		expect(render(ZBadge, { props: { dot: true } }).body).toContain('aria-hidden="true"');
	});

	it('renders every public visual variant as an explicit state', () => {
		const body = render(ZBadge, {
			props: {
				children: createRawSnippet(() => ({ render: () => '<span>Anchor</span>' })),
				count: 4,
				offset: [2, 3],
				overlap: 'circular',
				placement: 'bottom-start',
				size: 'small',
				tone: 'success'
			}
		}).body;
		expect(body).toContain('data-overlap="circular"');
		expect(body).toContain('data-placement="bottom-start"');
		expect(body).toContain('data-size="small"');
		expect(body).toContain('data-tone="success"');
		expect(body).toContain('data-slot="indicator"');
	});

	it('rejects values that cannot represent notification counts', () => {
		expect(() => render(ZBadge, { props: { count: -1 } }).body).toThrow(
			/non-negative safe integer/u
		);
		expect(() => render(ZBadge, { props: { count: 1.5 } }).body).toThrow(
			/non-negative safe integer/u
		);
		expect(() => render(ZBadge, { props: { count: 1, max: 0 } }).body).toThrow(
			/positive safe integer/u
		);
		expect(() => render(ZBadge, { props: { count: 1, offset: [0, Number.NaN] } }).body).toThrow(
			/two finite numbers/u
		);
		expect(
			() => render(ZBadge, { props: { count: 1, offset: new Array(2) as never } }).body
		).toThrow(/two finite numbers/u);
		expect(() => render(ZBadge, { props: { count: 1, size: 'large' as never } }).body).toThrow(
			/size must be small or medium/u
		);
		expect(() => render(ZBadge, { props: { count: 1, tone: 'info' as never } }).body).toThrow(
			/tone must be default, accent, success, warning or danger/u
		);
	});
});
