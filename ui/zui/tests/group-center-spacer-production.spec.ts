import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import ZCenter from '../src/components/layout/ZCenter.svelte';
import ZGroup from '../src/components/layout/ZGroup.svelte';
import ZSpacer from '../src/components/layout/ZSpacer.svelte';

describe('ZGroup, ZCenter and ZSpacer server contracts', () => {
	it('renders native div roots without roles, wrappers, observers or layout state', () => {
		const group = render(ZGroup, { props: { gap: 'small' } }).body;
		const center = render(ZCenter, { props: { inline: true } }).body;
		const spacer = render(ZSpacer, { props: { blockSize: 'large', inlineSize: 12 } }).body;
		for (const body of [group, center, spacer]) {
			expect(body).toContain('<div');
			expect(body).not.toContain('role=');
			expect(body).not.toContain('svelte-css-wrapper');
		}
		expect(group).toContain('data-item-sizing="auto"');
		expect(center).toContain('data-inline="true"');
	});

	it('rejects invalid Group sizing and invalid Spacer dimensions during SSR', () => {
		expect(() => render(ZGroup, { props: { itemSizing: 'shared' } as never }).body).toThrow(
			'itemSizing must be auto, grow or equal'
		);
		expect(() => render(ZSpacer, { props: { inlineSize: -1 } }).body).toThrow(
			'CSS length must be non-negative and finite'
		);
		expect(() => render(ZSpacer, { props: { blockSize: 'color:red' } }).body).toThrow(
			'CSS length or a balanced CSS sizing expression'
		);
	});
});
