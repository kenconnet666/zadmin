import { tick } from 'svelte';
import { describe, expect, it } from 'vitest';
import { mount, unmount } from './browser-lifecycle.js';
import ExtendedComponentDefaultsFixture from './ExtendedComponentDefaultsFixture.svelte';

const element = (id: string) => document.querySelector<HTMLElement>(`[data-testid="${id}"]`)!;
const style = (id: string) => getComputedStyle(element(id));
function target() {
	const host = document.createElement('div');
	document.body.append(host);
	return host;
}

describe('expanded visual component defaults', () => {
	it('projects typed defaults into real text, indicators and surfaces while retaining explicit and nested overrides', async () => {
		const host = target();
		const component = mount(ExtendedComponentDefaultsFixture, { target: host });
		await tick();
		expect(style('defaults-text').fontSize).toBe('16px');
		expect(style('defaults-text').fontWeight).toBe('600');
		expect(style('defaults-text').lineHeight).toBe('28px');
		expect(style('defaults-text').color).toBe('rgb(18, 52, 86)');
		expect(style('explicit-text').fontSize).toBe('14px');
		expect(style('explicit-text').fontWeight).toBe('400');
		expect(element('defaults-heading').tagName).toBe('H3');
		expect(style('defaults-heading').fontSize).toBe('32px');
		expect(style('defaults-heading').fontWeight).toBe('500');
		expect(style('defaults-heading').color).toBe('rgb(35, 103, 52)');
		expect(style('defaults-heading').textWrap).toBe('wrap');
		expect(element('defaults-icon').getBoundingClientRect().width).toBe(22);
		expect(element('defaults-icon').getAttribute('stroke-width')).toBe('1.5');
		expect(element('explicit-icon').getBoundingClientRect().width).toBe(12);
		expect(element('explicit-icon').getAttribute('stroke-width')).toBe('2');
		expect(element('defaults-spinner').getBoundingClientRect().width).toBe(24);
		expect(style('defaults-spinner').color).toBe('rgb(100, 116, 139)');
		expect(element('defaults-tag').getBoundingClientRect().height).toBe(48);
		expect(style('defaults-tag').color).toBe('rgb(35, 103, 52)');
		const badge = element('defaults-badge').querySelector<HTMLElement>('[data-slot="indicator"]')!;
		expect(badge.getBoundingClientRect().height).toBe(16);
		expect(getComputedStyle(badge).backgroundColor).toBe('rgb(136, 85, 0)');
		expect(element('defaults-badge').dataset.placement).toBe('bottom-start');
		expect(element('defaults-avatar').getBoundingClientRect().width).toBe(48);
		expect(style('defaults-avatar').borderRadius).toBe('0px');
		expect(style('nested-text').fontSize).toBe('16px');
		expect(style('nested-text').fontWeight).toBe('600');
		expect(style('nested-text').color).toBe('rgb(153, 0, 51)');
		expect(element('nested-icon').getBoundingClientRect().width).toBe(14);
		expect(style('text-null').fontSize).toBe('14px');
		expect(element('other-default-retained').dataset.tone).toBe('warning');
		expect(style('axis-null-text').fontSize).toBe('14px');
		expect(element('axis-null-toggle').getBoundingClientRect().height).toBe(32);
		expect(element('axis-null-toggle').dataset.variant).toBe('outline');
		await unmount(component);
		host.remove();
	});

	it('shares only compatible Button visuals and updates defaults without mutating business state', async () => {
		const host = target();
		const component = mount(ExtendedComponentDefaultsFixture, { target: host });
		await tick();
		expect(element('defaults-button').getBoundingClientRect().height).toBe(40);
		expect(element('defaults-button').getBoundingClientRect().width).toBe(250);
		expect(element('explicit-button').getBoundingClientRect().height).toBe(28);
		expect(element('explicit-button').getBoundingClientRect().width).toBeLessThan(250);
		expect(element('defaults-toggle').getBoundingClientRect().height).toBe(28);
		expect(style('defaults-toggle').color).toBe('rgb(35, 103, 52)');
		expect(element('defaults-toggle').dataset.variant).toBe('ghost');
		expect(element('defaults-link').getBoundingClientRect().height).toBe(40);
		expect(style('defaults-link').color).toBe('rgb(136, 85, 0)');
		expect(element('defaults-link').dataset.variant).toBe('outline');
		expect(element('defaults-link').getAttribute('href')).toBe('#native-target');
		expect(element('navigation-link').getBoundingClientRect().height).toBe(32);
		expect(style('explicit-text-link').textDecorationLine).toBe('underline');
		const busySpinner = element('busy-button').querySelector<HTMLElement>('[data-tone="inherit"]')!;
		expect(busySpinner.getBoundingClientRect().width).toBe(20);
		expect(getComputedStyle(busySpinner).color).toBe(style('busy-button').color);
		element('defaults-button').click();
		element('defaults-toggle').click();
		await tick();
		expect(element('defaults-events').textContent).toBe('1:true:1');
		component.changeDefaults();
		await tick();
		expect(style('defaults-text').fontSize).toBe('12px');
		expect(style('explicit-text').fontSize).toBe('14px');
		expect(element('defaults-button').getBoundingClientRect().height).toBe(24);
		expect(element('defaults-toggle').getBoundingClientRect().height).toBe(24);
		expect(element('defaults-toggle').dataset.variant).toBe('solid');
		expect(element('defaults-link').dataset.appearance).toBe('text');
		expect(element('defaults-link').getAttribute('href')).toBe('#native-target');
		expect(element('defaults-badge').textContent).toContain('7');
		expect(element('defaults-events').textContent).toBe('1:true:1');
		await unmount(component);
		host.remove();
	});

	it('keeps defaults reactive across Portal while explicit surface sizes remain authoritative', async () => {
		for (const explicitOverlaySize of [undefined, 'small'] as const) {
			const host = target();
			const component = mount(ExtendedComponentDefaultsFixture, {
				target: host,
				props: { explicitOverlaySize }
			});
			await tick();
			component.showSurface('dialog');
			await tick();
			expect(element('defaults-dialog').parentElement).toBe(document.body);
			expect(element('defaults-dialog').getBoundingClientRect().width).toBe(400);
			component.changeDefaults();
			await tick();
			expect(element('defaults-dialog').dataset.state).toBe('open');
			expect(element('defaults-dialog').getBoundingClientRect().width).toBe(
				explicitOverlaySize ? 400 : 768
			);
			component.showSurface('tooltip');
			await tick();
			expect(element('defaults-tooltip').parentElement).toBe(document.body);
			expect(style('defaults-tooltip').fontSize).toBe(explicitOverlaySize ? '12px' : '11px');
			await unmount(component);
			host.remove();
		}
	});
});
