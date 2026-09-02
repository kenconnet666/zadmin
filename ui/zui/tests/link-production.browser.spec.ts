import { tick } from 'svelte';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';

import LinkProductionFixture from './LinkProductionFixture.svelte';

describe('ZLink production contract', () => {
	it('separates external visuals from explicit new-window navigation and secures custom rel', () => {
		render(LinkProductionFixture);
		const blank = document.querySelector<HTMLAnchorElement>('[data-testid="link-external-blank"]')!;
		const sameWindow = document.querySelector<HTMLAnchorElement>(
			'[data-testid="link-external-same"]'
		)!;

		expect(blank.target).toBe('_blank');
		expect(new Set(blank.rel.split(/\s+/u))).toEqual(
			new Set(['nofollow', 'license', 'noopener', 'noreferrer'])
		);
		expect(blank.querySelector('[data-slot="external-icon"]')).not.toBeNull();
		expect(blank.querySelector('[data-slot="new-window-hint"]')?.textContent).toContain(
			'opens in a new window'
		);

		expect(sameWindow.hasAttribute('target')).toBe(false);
		expect(sameWindow.querySelector('[data-slot="external-icon"]')).not.toBeNull();
		expect(sameWindow.querySelector('[data-slot="new-window-hint"]')).toBeNull();
	});

	it('removes disabled navigation and prevents consumer and delegated click handlers', async () => {
		render(LinkProductionFixture);
		const disabled = document.querySelector<HTMLAnchorElement>('[data-testid="link-disabled"]')!;
		disabled.click();
		await tick();
		expect(disabled.hasAttribute('href')).toBe(false);
		expect(disabled.hasAttribute('target')).toBe(false);
		expect(disabled.hasAttribute('rel')).toBe(false);
		expect(disabled.tabIndex).toBe(-1);
		expect(disabled.getAttribute('aria-disabled')).toBe('true');
		expect(document.querySelector('[data-testid="link-output"]')?.textContent?.trim()).toBe(
			'0:0:0:A'
		);

		document.querySelector<HTMLAnchorElement>('[data-testid="link-enabled"]')?.click();
		await tick();
		expect(document.querySelector('[data-testid="link-output"]')?.textContent?.trim()).toBe(
			'0:1:1:A'
		);
	});

	it('forwards download and aria-current while long targets remain bounded', () => {
		render(LinkProductionFixture);
		const native = document.querySelector<HTMLAnchorElement>('[data-testid="link-native"]')!;
		const owner = document.querySelector<HTMLElement>('[data-testid="link-long-owner"]')!;
		const long = document.querySelector<HTMLAnchorElement>('[data-testid="link-long"]')!;
		expect(native.download).toBe('link-example.txt');
		expect(native.getAttribute('aria-current')).toBe('page');
		expect(getComputedStyle(long).overflowWrap).toBe('anywhere');
		expect(long.getBoundingClientRect().width).toBeLessThanOrEqual(
			owner.getBoundingClientRect().width
		);
	});

	it('uses the nearest typed locale for the hidden new-window hint', () => {
		render(LinkProductionFixture);
		const link = document.querySelector<HTMLAnchorElement>('[data-testid="link-localized"]')!;
		const hint = link.querySelector<HTMLElement>('[data-slot="new-window-hint"]')!;
		expect(hint.textContent).toContain('opens in another workspace');
		expect(link.getAttribute('aria-describedby')).toContain(hint.id);
	});
});
