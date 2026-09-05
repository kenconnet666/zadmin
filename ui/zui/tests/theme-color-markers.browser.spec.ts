import { expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';

import ThemeColorMarkerFixture from './ThemeColorMarkerFixture.svelte';
import { defaultTheme, extendTheme } from '../src/entrypoints/index.js';
import { neonDark } from '../src/entrypoints/themes.js';

const themes = [
	['default', defaultTheme],
	['dark', neonDark],
	[
		'custom',
		extendTheme(defaultTheme, {
			color: {
				accentSubtle: '#eeddee',
				dangerSubtle: '#fcddee',
				successSubtle: '#ddfcee',
				warningSubtle: '#fceedd',
				onPrimary: '#ffeecc',
				onDanger: '#ddeeff',
				surfaceHover: '#ccddff',
				text: '#302040'
			}
		})
	]
] as const;

function computed(testId: string, selector = ''): CSSStyleDeclaration {
	const root = document.querySelector<HTMLElement>(`[data-testid="${testId}"]`)!;
	return getComputedStyle(selector ? root.querySelector<HTMLElement>(selector)! : root);
}

it.each(themes)(
	'consumes overridden semantic surfaces and readable foregrounds: %s',
	(_name, theme) => {
		render(ThemeColorMarkerFixture, { theme });

		for (const [component, marker] of [
			['tag-accent', 'marker-accent-subtle'],
			['tag-danger', 'marker-danger-subtle'],
			['tag-success', 'marker-success-subtle'],
			['tag-warning', 'marker-warning-subtle'],
			['alert-info', 'marker-accent-subtle'],
			['alert-success', 'marker-success-subtle'],
			['alert-warning', 'marker-warning-subtle'],
			['alert-danger', 'marker-danger-subtle']
		] as const) {
			expect(computed(component).backgroundColor).toBe(computed(marker).backgroundColor);
		}

		for (const [component, marker] of [
			['alert-info', 'marker-accent'],
			['alert-success', 'marker-success'],
			['alert-warning', 'marker-warning'],
			['alert-danger', 'marker-danger']
		] as const) {
			expect(computed(component).borderTopColor).toBe(computed(marker).color);
			expect(computed(component, '[data-slot="icon"]').color).toBe(computed(marker).color);
			expect(computed(component).color).toBe(computed('marker-text').color);
		}

		for (const [component, marker] of [
			['button-primary', 'marker-on-primary'],
			['button-danger', 'marker-on-danger']
		] as const) {
			expect(computed(component).color).toBe(computed(marker).color);
		}
		expect(computed('badge-danger', '[data-slot="indicator"]').color).toBe(
			computed('marker-on-danger').color
		);
		expect(computed('calendar', 'button[data-selected="true"]').color).toBe(
			computed('marker-on-primary').color
		);

		for (const [component, marker] of [
			['button-primary-loading', 'marker-on-primary'],
			['button-danger-loading', 'marker-on-danger']
		] as const) {
			expect(computed(component, '[data-slot="indicator"]').color).toBe(computed(marker).color);
		}
	}
);

it.each(themes)(
	'uses custom surfaceHover for enabled secondary and ghost states: %s',
	async (_name, theme) => {
		render(ThemeColorMarkerFixture, { theme });
		const markerBackground = computed('marker-surface-hover').backgroundColor;
		for (const testId of ['button-secondary', 'button-ghost']) {
			await userEvent.hover(document.querySelector<HTMLElement>(`[data-testid="${testId}"]`)!);
			await expect.poll(() => computed(testId).backgroundColor).toBe(markerBackground);
		}
	}
);
