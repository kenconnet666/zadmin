import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import ZSimpleGrid from '../src/components/layout/ZSimpleGrid.svelte';

describe('ZSimpleGrid server contract', () => {
	it('keeps a native root and fixed-column mode in SSR without layout state', () => {
		const body = render(ZSimpleGrid, {
			props: {
				columns: 2,
				'data-testid': 'server-grid'
			}
		}).body;
		expect(body).toContain('data-testid="server-grid"');
		expect(body).toContain('<div');
		expect(body).toContain('data-mode="columns"');
	});

	it('prioritizes minItemWidth and rejects invalid minimum widths during SSR', () => {
		const body = render(ZSimpleGrid, { props: { columns: 2, minItemWidth: 160 } }).body;
		expect(body).toContain('data-mode="min-item-width"');
		expect(
			() => render(ZSimpleGrid, { props: { minItemWidth: 'calc(10rem + var(--invalid)' } }).body
		).toThrow('balanced CSS sizing expression');
	});

	it('preserves native CSS expressions in SSR instead of resolving lengths in JavaScript', () => {
		const body = render(ZSimpleGrid, { props: { minItemWidth: 'clamp(10rem, 20vw, 24rem)' } }).body;
		expect(body).toContain('data-mode="min-item-width"');
	});
});
