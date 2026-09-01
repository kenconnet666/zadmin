import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import ZLink from '../src/components/gene/ZLink.svelte';

describe('ZLink server contract', () => {
	it('keeps a real anchor, external Lucide and localized new-window hint', () => {
		const body = render(ZLink, {
			props: {
				children: (() => undefined) as never,
				external: true,
				href: 'https://example.com',
				rel: 'nofollow',
				target: '_blank'
			}
		}).body;
		expect(body).toContain('<a');
		expect(body).toContain('href="https://example.com"');
		expect(body).toContain('rel="nofollow noopener noreferrer"');
		expect(body).toContain('data-slot="external-icon"');
		expect(body).toContain('opens in a new window');
	});

	it('removes every navigation attribute while disabled', () => {
		const body = render(ZLink, {
			props: {
				disabled: true,
				href: '/disabled',
				rel: 'author',
				target: '_blank'
			}
		}).body;
		expect(body).toContain('aria-disabled="true"');
		expect(body).toContain('tabindex="-1"');
		expect(body).not.toContain('href=');
		expect(body).not.toContain('target=');
		expect(body).not.toContain('rel=');
		expect(body).not.toContain('new-window-hint');
	});
});
