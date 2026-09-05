import { expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';

import DisabledHoverFixture from './DisabledHoverFixture.svelte';

const style = (testId: string): CSSStyleDeclaration =>
	getComputedStyle(document.querySelector<HTMLElement>(`[data-testid="${testId}"]`)!);

async function hover(testId: string): Promise<void> {
	await userEvent.hover(document.querySelector<HTMLElement>(`[data-testid="${testId}"]`)!);
}

it('keeps disabled and aria-disabled controls visually stable while enabled hover remains active', async () => {
	render(DisabledHoverFixture);

	const enabledButtonBefore = style('button-enabled').backgroundColor;
	await hover('button-enabled');
	await expect.poll(() => style('button-enabled').backgroundColor).not.toBe(enabledButtonBefore);

	for (const testId of ['button-disabled', 'button-loading', 'button-aria-disabled']) {
		const before = style(testId).backgroundColor;
		await hover(testId);
		expect(style(testId).backgroundColor).toBe(before);
	}

	const enabledButtonLinkBefore = style('link-button-enabled').backgroundColor;
	await hover('link-button-enabled');
	await expect
		.poll(() => style('link-button-enabled').backgroundColor)
		.not.toBe(enabledButtonLinkBefore);
	const disabledButtonLinkBefore = style('link-button-disabled').backgroundColor;
	await hover('link-button-disabled');
	expect(style('link-button-disabled').backgroundColor).toBe(disabledButtonLinkBefore);

	const enabledNavigationBefore = style('link-nav-enabled').backgroundColor;
	await hover('link-nav-enabled');
	await expect
		.poll(() => style('link-nav-enabled').backgroundColor)
		.not.toBe(enabledNavigationBefore);
	const disabledNavigationBefore = style('link-nav-disabled').backgroundColor;
	await hover('link-nav-disabled');
	expect(style('link-nav-disabled').backgroundColor).toBe(disabledNavigationBefore);

	const enabledTextBefore = style('link-text-enabled').textDecorationLine;
	await hover('link-text-enabled');
	await expect.poll(() => style('link-text-enabled').textDecorationLine).toBe('underline');
	const disabledTextBefore = style('link-text-disabled').textDecorationLine;
	await hover('link-text-disabled');
	expect(style('link-text-disabled').textDecorationLine).toBe(disabledTextBefore);
});
