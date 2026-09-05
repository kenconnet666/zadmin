import { tick } from 'svelte';
import { expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';

import PresenceEasingFixture from './PresenceEasingFixture.svelte';

function element(testId: string): HTMLElement {
	return document.querySelector<HTMLElement>(`[data-testid="${testId}"]`)!;
}

it('uses Theme easing.enter for open Presence surfaces and forwards it to every overlay surface', async () => {
	render(PresenceEasingFixture);
	await tick();

	for (const testId of [
		'presence-dialog-overlay',
		'presence-dialog-content',
		'presence-popover-content',
		'presence-tooltip-content'
	]) {
		const surface = element(testId);
		expect(surface.dataset.state).toBe('open');
		expect(getComputedStyle(surface).transitionTimingFunction).toBe(
			'cubic-bezier(0.11, 0.22, 0.33, 0.44)'
		);
	}
});

it('uses Theme easing.exit while Dialog Presence remains mounted for close', async () => {
	render(PresenceEasingFixture);
	await tick();

	element('presence-dialog-close').click();
	await tick();
	const content = element('presence-dialog-content');
	const overlay = element('presence-dialog-overlay');
	expect(content.dataset.state).toBe('closed');
	expect(overlay.dataset.state).toBe('closed');
	expect(content.dataset.presence).toBe('exiting');
	expect(getComputedStyle(content).transitionTimingFunction).toBe(
		'cubic-bezier(0.55, 0.66, 0.77, 0.88)'
	);
	expect(getComputedStyle(overlay).transitionTimingFunction).toBe(
		'cubic-bezier(0.55, 0.66, 0.77, 0.88)'
	);
});
