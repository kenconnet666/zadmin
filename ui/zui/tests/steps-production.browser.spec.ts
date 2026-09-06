import { tick } from 'svelte';
import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { mount, unmount } from './browser-lifecycle.js';
import StepsFixture from './StepsFixture.svelte';
import StepsLongFixture from './StepsLongFixture.svelte';
import StepsUncontrolledFixture from './StepsUncontrolledFixture.svelte';

function host() {
	const node = document.createElement('div');
	document.body.append(node);
	return node;
}
function item(root: HTMLElement, key: string, type = 'string') {
	return root.querySelector<HTMLElement>(
		`[data-slot="item"][data-key="${key}"][data-key-type="${type}"]`
	)!;
}
function action(root: HTMLElement, key: string, type = 'string') {
	return item(root, key, type).querySelector<HTMLElement>('[data-slot="action"]')!;
}

describe('ZSteps native interaction and visual contract', () => {
	it('owns an uncontrolled baseline without reacting to new defaults or an unrelated form reset', async () => {
		const target = host();
		const component = mount(StepsUncontrolledFixture, { target });
		await tick();
		expect(item(target, 'one').getAttribute('aria-current')).toBe('step');
		action(target, 'two').click();
		await tick();
		component.changeInitial();
		await tick();
		target.querySelector('form')!.reset();
		await tick();
		expect(item(target, 'two').getAttribute('aria-current')).toBe('step');
		component.reset();
		await tick();
		expect(item(target, 'one').getAttribute('aria-current')).toBe('step');
		expect(target.querySelector('output')?.textContent).toBe('1');
		await unmount(component);
		target.remove();
	});

	it('allows canceling a real href request without navigating or selecting the target', async () => {
		const target = host();
		const component = mount(StepsFixture, { target });
		await tick();
		component.cancelRequests(true);
		await tick();
		const event = new MouseEvent('click', { bubbles: true, cancelable: true });
		action(target, 'link').dispatchEvent(event);
		await tick();
		expect(event.defaultPrevented).toBe(true);
		expect(target.querySelector('output')?.textContent).toBe('number:1:1:0');
		expect(action(target, 'link').getAttribute('href')).toBe('#steps-target');
		await unmount(component);
		target.remove();
	});

	it('uses Theme transitions and releases the loading animation on unmount', async () => {
		const target = host();
		const component = mount(StepsFixture, { target, props: { reduced: false } });
		await tick();
		const loading = item(target, 'loading');
		const marker = loading.querySelector<HTMLElement>('[data-slot="indicator"]')!;
		expect(getComputedStyle(marker).transitionDuration).toBe('0.12s');
		expect(getComputedStyle(marker).transitionTimingFunction).toBe('ease');
		await expect
			.poll(
				() =>
					loading
						.getAnimations({ subtree: true })
						.filter((animation) => animation.playState === 'running').length
			)
			.toBe(1);
		const animation = loading.getAnimations({ subtree: true })[0]!;
		await unmount(component);
		expect(animation.playState).toBe('idle');
		expect(loading.isConnected).toBe(false);
		target.remove();
	});

	it('keeps passive, button and link roles distinct and cancels requests before state changes', async () => {
		const target = host();
		const component = mount(StepsFixture, { target });
		await tick();
		expect(action(target, 'passive').tagName).toBe('DIV');
		expect(action(target, '1').tagName).toBe('BUTTON');
		expect(action(target, 'link').tagName).toBe('A');
		expect(action(target, 'link').getAttribute('href')).toBe('#steps-target');
		expect(action(target, 'disabled-link').getAttribute('href')).toBeNull();
		expect(action(target, 'disabled-link').tabIndex).toBe(-1);
		expect(item(target, '1', 'number').getAttribute('aria-current')).toBe('step');
		component.cancelRequests(true);
		await tick();
		const canceled = new MouseEvent('click', { bubbles: true, cancelable: true });
		action(target, '1').dispatchEvent(canceled);
		await tick();
		expect(canceled.defaultPrevented).toBe(true);
		expect(target.querySelector('output')?.textContent).toBe('number:1:1:0');
		component.cancelRequests(false);
		await tick();
		action(target, '1').click();
		await tick();
		expect(target.querySelector('output')?.textContent).toBe('string:1:2:1');
		expect(target.querySelectorAll('[aria-current="step"]')).toHaveLength(1);
		for (const key of ['disabled', 'loading', 'disabled-link']) action(target, key).click();
		await tick();
		expect(target.querySelector('output')?.textContent).toBe('string:1:2:1');
		await unmount(component);
		target.remove();
	});
	it('uses native keyboard activation without roving or arrow interception', async () => {
		const target = host();
		const component = mount(StepsFixture, { target });
		await tick();
		const second = action(target, '1');
		second.focus();
		const arrow = new KeyboardEvent('keydown', {
			key: 'ArrowRight',
			bubbles: true,
			cancelable: true
		});
		second.dispatchEvent(arrow);
		expect(arrow.defaultPrevented).toBe(false);
		expect(document.activeElement).toBe(second);
		await userEvent.keyboard('{Enter}');
		await tick();
		expect(item(target, '1').getAttribute('aria-current')).toBe('step');
		expect(action(target, '1', 'number').tabIndex).toBe(0);
		expect(second.tabIndex).toBe(0);
		expect(target.querySelector('[role="tablist"]')).toBeNull();
		await unmount(component);
		target.remove();
	});
	it('preserves keys across reorder/removal and gives external changes/reset no user notifications', async () => {
		const target = host();
		const component = mount(StepsFixture, { target });
		await tick();
		action(target, '1').click();
		await tick();
		component.reorder();
		await tick();
		expect(item(target, '1').getAttribute('aria-current')).toBe('step');
		component.removeCurrent();
		await tick();
		expect(target.querySelector('[aria-current="step"]')).toBeNull();
		expect(target.querySelector('output')?.textContent).toBe('string:1:1:1');
		component.choose(null);
		await tick();
		expect(target.querySelector('[aria-current="step"]')).toBeNull();
		component.reset();
		await tick();
		expect(item(target, '1', 'number').getAttribute('aria-current')).toBe('step');
		expect(target.querySelector('output')?.textContent).toBe('number:1:1:1');
		await unmount(component);
		target.remove();
	});
	it.each([
		['xsmall', 24, 11],
		['small', 28, 12],
		['medium', 32, 14],
		['large', 40, 16],
		['xlarge', 48, 16]
	] as const)(
		'projects %s marker, typography and theme into real geometry',
		async (size, height, fontSize) => {
			// @zui-visual ZSteps five-size marker geometry, current/status theme and reduced motion
			const target = host();
			const component = mount(StepsFixture, { target, props: { size } });
			await tick();
			const marker = item(target, '1').querySelector<HTMLElement>('[data-slot="indicator"]')!;
			expect(marker.getBoundingClientRect().height).toBe(height);
			expect(marker.getBoundingClientRect().width).toBe(height);
			expect(getComputedStyle(action(target, '1')).fontSize).toBe(`${fontSize}px`);
			component.choose('1');
			await tick();
			expect(getComputedStyle(marker).color).toBe('rgb(18, 52, 86)');
			component.swapTheme();
			await tick();
			expect(getComputedStyle(marker).color).toBe('rgb(102, 51, 153)');
			expect(getComputedStyle(marker).transitionDuration).toBe('0s');
			const complete = item(target, '1', 'number').querySelector<HTMLElement>(
				'[data-slot="indicator"]'
			)!;
			expect(getComputedStyle(complete).color).toBe('rgb(35, 103, 52)');
			const loading = item(target, 'loading');
			expect(loading.getAttribute('aria-busy')).toBe('true');
			expect(
				loading
					.getAnimations({ subtree: true })
					.filter((animation) => animation.playState === 'running')
			).toHaveLength(0);
			await unmount(component);
			target.remove();
		}
	);
	it.each(['horizontal', 'vertical'] as const)(
		'wraps long %s titles and descriptions in narrow RTL owners',
		async (orientation) => {
			// @zui-visual ZSteps narrow owner, natural long-word wrapping and logical connectors
			const target = host();
			const component = mount(StepsLongFixture, {
				target,
				props: { direction: 'rtl', orientation }
			});
			await tick();
			const boundary = target.querySelector<HTMLElement>('[data-testid="steps-long-boundary"]')!;
			const root = boundary.querySelector<HTMLOListElement>('ol')!;
			expect(root.scrollWidth).toBeLessThanOrEqual(root.clientWidth);
			expect(boundary.scrollWidth).toBeLessThanOrEqual(boundary.clientWidth);
			expect(getComputedStyle(root).direction).toBe('rtl');
			const first = item(root, 'one');
			const second = item(root, 'two');
			if (orientation === 'horizontal')
				expect(first.getBoundingClientRect().left).toBeGreaterThan(
					second.getBoundingClientRect().left
				);
			else
				expect(second.getBoundingClientRect().top).toBeGreaterThan(
					first.getBoundingClientRect().top
				);
			expect(getComputedStyle(first, '::after').content).toBe('""');
			expect(getComputedStyle(item(root, 'three'), '::after').content).toBe('none');
			expect(root.querySelectorAll('[data-testid="steps-custom-title"]')).toHaveLength(3);
			expect(
				getComputedStyle(item(root, 'two').querySelector('[data-slot="indicator"]')!).color
			).toBe('rgb(180, 35, 24)');
			await unmount(component);
			target.remove();
		}
	);
});
