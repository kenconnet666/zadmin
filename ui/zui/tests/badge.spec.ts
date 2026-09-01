import { render } from 'svelte/server';
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

	it('rejects values that cannot represent notification counts', () => {
		expect(() => render(ZBadge, { props: { count: -1 } })).toThrow(/non-negative safe integer/u);
		expect(() => render(ZBadge, { props: { count: 1.5 } })).toThrow(/non-negative safe integer/u);
		expect(() => render(ZBadge, { props: { count: 1, max: 0 } })).toThrow(/positive safe integer/u);
		expect(() => render(ZBadge, { props: { count: 1, offset: [0, Number.NaN] } })).toThrow(
			/two finite numbers/u
		);
	});
});
