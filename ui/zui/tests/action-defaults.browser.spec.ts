import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';

import ActionDefaultsFixture from './ActionDefaultsFixture.svelte';

function element(testId: string): HTMLElement {
	return document.querySelector<HTMLElement>(`[data-testid="${testId}"]`)!;
}

function itemSizes(testId: string): Array<string | undefined> {
	return [...element(testId).querySelectorAll<HTMLElement>('[data-slot="item"]')].map(
		(item) => item.dataset.size
	);
}

function firstItem(testId: string): HTMLElement {
	return element(testId).querySelector<HTMLElement>('[data-slot="item"]')!;
}

describe('action family default size and tone composition', () => {
	it('propagates Provider and Toolbar defaults while explicit and Field sizes win', async () => {
		await render(ActionDefaultsFixture);

		expect(element('provider-button').dataset.size).toBe('small');
		expect(element('provider-toggle').dataset.size).toBe('xsmall');
		expect(itemSizes('provider-toggle')).toEqual(['xsmall', 'xsmall']);
		expect(element('provider-segmented').dataset.size).toBe('large');

		expect(element('action-toolbar').dataset.size).toBe('large');
		expect(element('toolbar-button').dataset.size).toBe('large');
		expect(element('toolbar-toggle').dataset.size).toBe('large');
		expect(itemSizes('toolbar-toggle')).toEqual(['large', 'large']);
		expect(element('toolbar-segmented').dataset.size).toBe('large');
		expect(element('toolbar-segmented-family').dataset.size).toBe('medium');
		// This family value originates outside the Toolbar, not in a nearer nested Provider.
		expect(element('inherited-family-toolbar-button').dataset.size).toBe('xlarge');
		expect(element('inherited-family-segmented').dataset.size).toBe('small');
		expect(element('toolbar-explicit-button').dataset.size).toBe('xsmall');

		expect(element('field-toggle-owner').querySelectorAll('[role="group"]')).toHaveLength(1);
		expect(element('field-segmented-owner').querySelectorAll('[role="radiogroup"]')).toHaveLength(
			1
		);
		expect(element('field-toggle').dataset.size).toBe('xlarge');
		expect(itemSizes('field-toggle')).toEqual(['xlarge', 'xlarge']);
		expect(element('field-segmented').dataset.size).toBe('xlarge');

		const toolbarButton = element('toolbar-button');
		expect(getComputedStyle(toolbarButton).height).toBe(
			getComputedStyle(firstItem('toolbar-toggle')).height
		);
		expect(getComputedStyle(toolbarButton).fontSize).toBe(
			getComputedStyle(firstItem('toolbar-toggle')).fontSize
		);
		expect(getComputedStyle(firstItem('field-toggle')).height).toBe('48px');
		expect(getComputedStyle(firstItem('field-toggle')).fontSize).toBe('16px');
	});

	it('honors the shared Button tone override while CopyButton keeps its neutral default', async () => {
		await render(ActionDefaultsFixture);

		// A non-default tone distinguishes actual inheritance from Button's primary fallback.
		expect(element('provider-button').dataset.tone).toBe('danger');
		expect(element('toolbar-button').dataset.tone).toBe('danger');
		expect(element('provider-copy').dataset.tone).toBe('neutral');
	});
});
