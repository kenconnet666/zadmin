import { expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';

import CardElevationFixture from './CardElevationFixture.svelte';

function card(testId: string): HTMLElement {
	return document.querySelector<HTMLElement>(`[data-testid="${testId}"]`)!;
}

it('resolves ZCard elevation defaults, explicit overrides and data contract', () => {
	render(CardElevationFixture);

	expect(card('elevation-default').dataset.elevation).toBe('small');
	expect(card('elevation-outlined').dataset.elevation).toBe('none');
	expect(card('elevation-explicit-medium').dataset.elevation).toBe('medium');
	expect(card('elevation-explicit-none').dataset.elevation).toBe('none');
	expect(getComputedStyle(card('elevation-outlined')).boxShadow).toBe('none');
	expect(getComputedStyle(card('elevation-explicit-medium')).boxShadow).not.toBe('none');
});

it('consumes custom Theme shadow.large through Provider defaults and explicit props', () => {
	render(CardElevationFixture);

	for (const testId of ['elevation-provider-default', 'elevation-explicit-large']) {
		const element = card(testId);
		expect(element.dataset.elevation).toBe('large');
		expect(getComputedStyle(element).boxShadow).toContain('13px');
	}
});
