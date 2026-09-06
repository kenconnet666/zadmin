import { beforeEach, afterEach, describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { tick } from 'svelte';
import { mount, unmount } from './browser-lifecycle.js';
import AnchorFixture from './AnchorFixture.svelte';
let original: { width: number; height: number };
beforeEach(async () => {
	original = { width: innerWidth, height: innerHeight };
	await page.viewport(1024, 768);
});
afterEach(async () => {
	await page.viewport(original.width, original.height);
});
function host(): HTMLDivElement {
	const target = document.createElement('div');
	document.body.append(target);
	return target;
}
describe('Anchor browser ownership', () => {
	it('uses the actual scroll container, CSS offsets and native target focus under reduced motion', async () => {
		// @zui-visual ZAnchor nested directory and scroll target geometry
		const target = host();
		const app = mount(AnchorFixture, { target });
		await tick();
		const viewport = target.querySelector<HTMLElement>('[data-testid=anchor-viewport]')!;
		const state = target.querySelector<HTMLElement>('[data-testid=anchor-state]')!;
		await expect.poll(() => state.dataset.active).toBe('alpha');
		const url = location.href;
		await userEvent.click(target.querySelector<HTMLAnchorElement>('a[data-key=beta]')!);
		await expect.poll(() => Math.abs(viewport.scrollTop - 268)).toBeLessThan(0.5);
		expect(document.activeElement).toBe(target.querySelector('#anchor-fixture-beta'));
		expect(state.dataset.active).toBe('beta');
		expect(state.dataset.requests).toBe('1');
		expect(location.href).toBe(url);
		await userEvent.keyboard('{Tab}');
		expect(target.querySelector('#anchor-fixture-beta')!.hasAttribute('tabindex')).toBe(false);
		viewport.scrollTo({ top: viewport.scrollHeight, behavior: 'instant' });
		await expect.poll(() => state.dataset.active).toBe('gamma');
		await unmount(app);
		target.remove();
	});
	it('cancels before any focus/scroll/history change and leaves modified activation to the browser', async () => {
		const target = host();
		const app = mount(AnchorFixture, { target });
		await tick();
		const viewport = target.querySelector<HTMLElement>('[data-testid=anchor-viewport]')!;
		const state = target.querySelector<HTMLElement>('[data-testid=anchor-state]')!;
		await userEvent.click(target.querySelector<HTMLButtonElement>('[data-testid=anchor-cancel]')!);
		const beta = target.querySelector<HTMLAnchorElement>('a[data-key=beta]')!;
		await userEvent.click(beta);
		expect(viewport.scrollTop).toBe(0);
		expect(document.activeElement).toBe(beta);
		expect(state.dataset.requests).toBe('1');
		let preserved = false;
		const preventNavigation = (event: MouseEvent) => {
			preserved = !event.defaultPrevented;
			event.preventDefault();
		};
		target.addEventListener('click', preventNavigation, { once: true });
		await userEvent.keyboard('{Control>}');
		await userEvent.click(beta);
		await userEvent.keyboard('{/Control}');
		expect(preserved).toBe(true);
		expect(state.dataset.requests).toBe('1');
		await unmount(app);
		target.remove();
	});
	it('reconciles removed sections and stops observers after unmount', async () => {
		const target = host();
		const app = mount(AnchorFixture, { target });
		await tick();
		const state = target.querySelector<HTMLElement>('[data-testid=anchor-state]')!;
		await userEvent.click(target.querySelector<HTMLAnchorElement>('a[data-key=beta]')!);
		await expect.poll(() => state.dataset.active).toBe('beta');
		app.removeSecond();
		await tick();
		await expect.poll(() => state.dataset.active).not.toBe('beta');
		expect(target.querySelector('a[data-key=beta]')).toBeNull();
		app.setDisabled(true);
		await tick();
		await expect.poll(() => state.dataset.active).toBeUndefined();
		expect([...target.querySelectorAll('a')].every((a) => a.tabIndex === -1)).toBe(true);
		await unmount(app);
		target.remove();
	});
	it('resolves targets in the known ShadowRoot and owns that root focus', async () => {
		const target = host();
		const shadow = target.attachShadow({ mode: 'open' });
		const app = mount(AnchorFixture, { target: shadow });
		await tick();
		const state = shadow.querySelector<HTMLElement>('[data-testid=anchor-state]')!;
		await userEvent.click(shadow.querySelector<HTMLAnchorElement>('a[data-key=beta]')!);
		await expect.poll(() => state.dataset.active).toBe('beta');
		expect(shadow.activeElement).toBe(shadow.querySelector('#anchor-fixture-beta'));
		await unmount(app);
		target.remove();
	});
});
