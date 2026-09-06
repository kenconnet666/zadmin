import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import ZAppShell from '../src/components/layout/ZAppShell.svelte';

describe('ZAppShell server contract', () => {
	it('renders a deterministic native main shell without browser geometry state', () => {
		const body = render(ZAppShell, { props: { 'data-testid': 'shell' } }).body;
		expect(body).toContain('<div');
		expect(body).toContain('<main');
		expect(body).toContain('data-layout="default"');
		expect(body).toContain('data-scroll="main"');
		expect(body).not.toContain('ResizeObserver');
	});

	it('renders supplied native regions and validates closed layout axes while reading server output', () => {
		const body = render(ZAppShell, {
			props: {
				aside: (() => undefined) as never,
				footer: (() => undefined) as never,
				header: (() => undefined) as never,
				mainAs: 'div',
				navbar: (() => undefined) as never
			}
		}).body;
		expect(body).toContain('<header');
		expect(body).toContain('<nav');
		expect(body).toContain('<aside');
		expect(body).toContain('<footer');
		expect(body).toContain('aria-label="Primary navigation"');
		expect(body).toContain('data-main-as="div"');
		expect(() => render(ZAppShell, { props: { mainAs: 'section' } as never }).body).toThrow(
			'mainAs must be main or div'
		);
	});
});
