import { expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import IcssTokenIntegrationFixture from './IcssTokenIntegrationFixture.svelte';

it('applies custom media/focus/easing tokens and keeps system colors independent of theme colors', () => {
	render(IcssTokenIntegrationFixture);
	const node = (id: string) => document.querySelector<HTMLElement>(`[data-testid="${id}"]`)!;
	expect(node('responsive').getBoundingClientRect().width).toBe(240);
	expect(getComputedStyle(node('responsive')).backgroundColor).toBe('rgb(17, 34, 51)');
	expect(getComputedStyle(node('system')).color).toBe(
		getComputedStyle(node('system-reference')).color
	);
	expect(getComputedStyle(node('system')).backgroundColor).toBe(
		getComputedStyle(node('system-reference')).backgroundColor
	);
	node('focus').focus();
	expect(getComputedStyle(node('focus')).outlineOffset).toBe('5px');
	expect(getComputedStyle(node('focus')).transitionTimingFunction).toBe('linear');
});
