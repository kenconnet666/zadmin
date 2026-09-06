import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import ExtendedComponentDefaultsFixture from './ExtendedComponentDefaultsFixture.svelte';

describe('extended component defaults SSR', () => {
	it('resolves visual defaults without browser globals while semantic values and closed overlays stay owned by callers', () => {
		const body = render(ExtendedComponentDefaultsFixture).body;
		expect(body).toContain('data-testid="defaults-heading"');
		expect(body).toMatch(/<h3[^>]*data-testid="defaults-heading"/u);
		expect(body).toContain('href="#native-target"');
		expect(body.replace(/<!--[\s\S]*?-->/gu, '')).toContain('0:false:0');
		expect(body).not.toContain('data-testid="defaults-dialog"');
		expect(body).not.toContain('data-testid="defaults-tooltip"');
	});
});
