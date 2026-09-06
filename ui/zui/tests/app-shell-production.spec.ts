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
		expect(body).toContain('data-region="main" data-slot="main" tabindex="0"');
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
		expect(body).toContain('data-region="navbar" data-slot="navbar" tabindex="0"');
		expect(body).toContain('data-region="aside" data-slot="aside" tabindex="0"');
		const explicitTabIndex = render(ZAppShell, { props: { scroll: 'root', tabindex: -1 } }).body;
		expect(explicitTabIndex).toContain('tabindex="-1"');
		expect(() => render(ZAppShell, { props: { mainAs: 'section' } as never }).body).toThrow(
			'mainAs must be main or div'
		);
	});
});
