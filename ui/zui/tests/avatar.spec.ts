import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';

import ZAvatar from '../src/components/data-display/ZAvatar.svelte';

describe('ZAvatar server contract', () => {
	it('renders explicit shape and size states with a named fallback', () => {
		const body = render(ZAvatar, {
			props: { alt: 'Production avatar', fallbackText: 'P', shape: 'rounded', size: 'large' }
		}).body;
		expect(body).toContain('data-shape="rounded"');
		expect(body).toContain('data-size="large"');
		expect(body).toContain('data-state="fallback"');
		expect(body).toContain('role="img"');
		expect(body).toContain('aria-label="Production avatar"');
	});

	it('keeps a combined emoji fallback as one grapheme', () => {
		const body = render(ZAvatar, { props: { alt: '👩‍💻 developer' } }).body;
		expect(body).toMatch(/data-slot="fallback"[^>]*>.*👩‍💻.*<\/span>/u);
	});

	it('rejects a non-string accessible alt and unsupported visual variants', () => {
		expect(() => render(ZAvatar, { props: { alt: 42 as never } }).body).toThrow(
			/alt must be a string/u
		);
		expect(
			() => render(ZAvatar, { props: { alt: 'Avatar', shape: 'pill' as never } }).body
		).toThrow(/shape must be circle, rounded or square/u);
		expect(
			() => render(ZAvatar, { props: { alt: 'Avatar', size: 'xlarge' as never } }).body
		).toThrow(/size must be small, medium or large/u);
	});
});
