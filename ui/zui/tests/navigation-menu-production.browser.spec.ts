import { tick } from 'svelte';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';

import NavigationMenuFixture from './NavigationMenuFixture.svelte';
import { mount, unmount } from './browser-lifecycle.js';

let originalViewport: { height: number; width: number };

beforeEach(async () => {
	originalViewport = { height: window.innerHeight, width: window.innerWidth };
	await page.viewport(1024, 768);
});

afterEach(async () => {
	await page.viewport(originalViewport.width, originalViewport.height);
});

function navigation(label: string, owner: ParentNode = document): HTMLElement {
	return owner.querySelector<HTMLElement>(`nav[aria-label="${label}"]`)!;
}

function output(testId: string, owner: ParentNode = document): string | null | undefined {
	return owner.querySelector<HTMLOutputElement>(`[data-testid="${testId}"]`)?.textContent;
}

function controlledPanel(control: HTMLElement): HTMLElement | null {
	const id = control.getAttribute('aria-controls');
	return id ? document.getElementById(id) : null;
}

describe('ZNavigationMenu production browser contract', () => {
	it('keeps inline disclosure, native links, static groups, current state and disabled state separate', async () => {
		render(NavigationMenuFixture);
		await tick();
		const root = navigation('Inline navigation');
		const list = root.querySelector<HTMLUListElement>(':scope > ul[data-slot="list"]')!;
		const home = root.querySelector<HTMLAnchorElement>('a[href="/inline-home"]')!;
		const projects = root.querySelector<HTMLAnchorElement>('a[href="/projects"]')!;
		const projectsRow = projects.closest<HTMLElement>('[data-slot="row"]')!;
		const disclosure = projectsRow.querySelector<HTMLButtonElement>(
			':scope > button[data-slot="disclosure"]'
		)!;
		const resources = root.querySelector<HTMLButtonElement>(
			'li[data-key="inline-resources"] > button[data-slot="primary"]'
		)!;
		const group = root.querySelector<HTMLElement>('[data-slot="group"]')!;
		const disabled = root.querySelector<HTMLAnchorElement>(
			'li[data-key="inline-disabled"] a[data-slot="primary"]'
		)!;

		expect(root.getAttribute('role')).toBeNull();
		expect(list.getAttribute('role')).toBe('list');
		expect(list.querySelectorAll(':scope > li')).toHaveLength(6);
		expect(root.querySelector('[role="menu"], [role="menuitem"]')).toBeNull();
		expect(home.getAttribute('aria-current')).toBe('page');
		expect(projects.getAttribute('aria-current')).toBeNull();
		expect(projectsRow.querySelectorAll(':scope > a')).toHaveLength(1);
		expect(projectsRow.querySelectorAll(':scope > button')).toHaveLength(1);
		expect(projects).not.toBe(disclosure);
		expect(disclosure.type).toBe('button');
		expect(disclosure.getAttribute('aria-expanded')).toBe('false');
		expect(resources.type).toBe('button');
		expect(resources.getAttribute('aria-expanded')).toBe('false');
		expect(group.getAttribute('role')).toBe('group');
		expect(group.getAttribute('aria-labelledby')).toBe(
			group.querySelector<HTMLElement>('[data-slot="group-label"]')?.id
		);
		expect(group.querySelector('[data-slot="group-label"]')?.textContent).toBe('Workspace');
		expect(disabled.getAttribute('href')).toBeNull();
		expect(disabled.getAttribute('aria-disabled')).toBe('true');
		expect(disabled.tabIndex).toBe(-1);

		home.focus();
		await userEvent.keyboard('{ArrowDown}');
		expect(document.activeElement).toBe(projects);
		expect(home.getAttribute('aria-current')).toBe('page');
		expect(projects.getAttribute('aria-current')).toBeNull();
		expect(output('inline-navigation-output')).toBe('inline-home||0');

		await userEvent.click(disclosure);
		await expect.poll(() => disclosure.getAttribute('aria-expanded')).toBe('true');
		const panel = controlledPanel(disclosure)!;
		expect(panel).not.toBeNull();
		expect(root.contains(panel)).toBe(true);
		expect(panel.dataset.state).toBe('open');
		expect(panel.querySelectorAll('li[data-key="1"][data-key-type="number"]')).toHaveLength(1);
		expect(panel.querySelectorAll('li[data-key="1"][data-key-type="string"]')).toHaveLength(1);
		expect(output('inline-navigation-output')).toBe('inline-home|inline-projects|1');
	});

	it('uses real horizontal and vertical Popover buttons and restores disclosure focus on Escape', async () => {
		render(NavigationMenuFixture);
		await tick();

		const horizontal = navigation('Horizontal navigation');
		const products = horizontal.querySelector<HTMLAnchorElement>('a[href="/products"]')!;
		const horizontalDisclosure = products
			.closest<HTMLElement>('[data-slot="row"]')!
			.querySelector<HTMLButtonElement>('button[data-slot="disclosure"]')!;
		expect(products.tagName).toBe('A');
		expect(horizontalDisclosure.tagName).toBe('BUTTON');
		expect(horizontalDisclosure.getAttribute('aria-controls')).toBeTruthy();
		await userEvent.click(horizontalDisclosure);
		await expect.poll(() => horizontalDisclosure.getAttribute('aria-expanded')).toBe('true');
		const horizontalPanel = controlledPanel(horizontalDisclosure)!;
		expect(horizontalPanel.getAttribute('role')).toBe('region');
		expect(horizontalPanel.parentElement).toBe(document.body);
		expect(document.activeElement).toBe(
			horizontalPanel.querySelector<HTMLAnchorElement>('a[href="/products/overview"]')
		);
		await userEvent.keyboard('{Escape}');
		await expect.poll(() => horizontalDisclosure.getAttribute('aria-expanded')).toBe('false');
		await expect.poll(() => document.activeElement).toBe(horizontalDisclosure);

		const vertical = navigation('Vertical navigation');
		const verticalDisclosure = vertical.querySelector<HTMLButtonElement>(
			'li[data-key="vertical-admin"] > button[data-slot="primary"]'
		)!;
		expect(verticalDisclosure.type).toBe('button');
		await userEvent.click(verticalDisclosure);
		await expect.poll(() => verticalDisclosure.getAttribute('aria-expanded')).toBe('true');
		const verticalPanel = controlledPanel(verticalDisclosure)!;
		expect(verticalPanel.getAttribute('role')).toBe('region');
		expect(verticalPanel.parentElement).toBe(document.body);
		expect(document.activeElement).toBe(
			verticalPanel.querySelector<HTMLAnchorElement>('a[href="/admin/users"]')
		);
		await userEvent.keyboard('{Escape}');
		await expect.poll(() => verticalDisclosure.getAttribute('aria-expanded')).toBe('false');
		await expect.poll(() => document.activeElement).toBe(verticalDisclosure);
	});

	it('lets an owner prevent a same-origin request, confirm currentKey and close the panel', async () => {
		const target = document.createElement('div');
		document.body.append(target);
		const component = mount(NavigationMenuFixture, { target });
		try {
			const horizontal = navigation('Horizontal navigation', target);
			const products = horizontal.querySelector<HTMLAnchorElement>('a[href="/products"]')!;
			const disclosure = products
				.closest<HTMLElement>('[data-slot="row"]')!
				.querySelector<HTMLButtonElement>('button[data-slot="disclosure"]')!;
			const originalLocation = window.location.href;

			await userEvent.click(disclosure);
			await expect.poll(() => disclosure.getAttribute('aria-expanded')).toBe('true');
			const overview = controlledPanel(disclosure)!.querySelector<HTMLAnchorElement>(
				'a[href="/products/overview"]'
			)!;
			await userEvent.click(overview);
			await expect
				.poll(() => output('horizontal-navigation-output', target))
				.toBe('horizontal-home|horizontal-products|1|horizontal-overview|/products/overview');
			expect(disclosure.getAttribute('aria-expanded')).toBe('true');
			expect(window.location.href).toBe(originalLocation);

			component.confirmNavigation();
			await expect.poll(() => disclosure.getAttribute('aria-expanded')).toBe('false');
			expect(output('horizontal-navigation-output', target)).toBe(
				'horizontal-overview||1|horizontal-overview|/products/overview'
			);
			await userEvent.click(disclosure);
			await expect.poll(() => disclosure.getAttribute('aria-expanded')).toBe('true');
			expect(
				controlledPanel(disclosure)!
					.querySelector<HTMLAnchorElement>('a[href="/products/overview"]')!
					.getAttribute('aria-current')
			).toBe('page');
		} finally {
			await unmount(component);
			target.remove();
		}
	});

	it('leaves modified, new-window and external links on their native path', async () => {
		render(NavigationMenuFixture);
		await tick();
		const horizontal = navigation('Horizontal navigation');
		const modified = horizontal.querySelector<HTMLAnchorElement>('a[href="/native-modified"]')!;
		const newWindow = horizontal.querySelector<HTMLAnchorElement>('a[href="/native-window"]')!;
		const external = horizontal.querySelector<HTMLAnchorElement>(
			'a[href="https://example.com/navigation"]'
		)!;

		await userEvent.keyboard('{Control>}');
		await userEvent.click(modified);
		await userEvent.keyboard('{/Control}');
		await userEvent.click(newWindow);
		await userEvent.click(external);
		await tick();

		expect(newWindow.target).toBe('_blank');
		expect(newWindow.rel).toContain('noreferrer');
		expect(external.dataset.external).toBe('true');
		expect(output('horizontal-navigation-output')).toBe('horizontal-home||0|null|');
		expect(output('native-navigation-output')).toBe(
			'/native-modified:native|/native-window:native|https://example.com/navigation:native'
		);
	});

	it('keeps collapsed RTL navigation named, bounded and fully available through its flyout', async () => {
		render(NavigationMenuFixture);
		await tick();
		const owner = document.querySelector<HTMLElement>(
			'[data-testid="collapsed-navigation-owner"]'
		)!;
		const root = navigation('Collapsed RTL navigation', owner);
		const library = root.querySelector<HTMLButtonElement>(
			'button[data-slot="primary"][aria-label="Component library"]'
		)!;
		const account = root.querySelector<HTMLAnchorElement>(
			'a[data-slot="primary"][aria-label="Account settings"]'
		)!;

		expect(root.dir).toBe('rtl');
		expect(root.dataset.collapsed).toBe('true');
		expect(library.dataset.compact).toBe('true');
		expect(library.title).toBe('Component library');
		expect(account.dataset.compact).toBe('true');
		expect(account.title).toBe('Account settings');
		expect(owner.scrollWidth).toBeLessThanOrEqual(owner.clientWidth + 1);

		await userEvent.click(library);
		await expect.poll(() => library.getAttribute('aria-expanded')).toBe('true');
		const panel = controlledPanel(library)!;
		expect(panel.getAttribute('role')).toBe('region');
		expect(panel.querySelector('a[href="/library/buttons"]')?.textContent).toContain('Buttons');
		expect(panel.querySelector('a[href="/library/inputs"]')?.textContent).toContain('Inputs');
		await userEvent.keyboard('{Escape}');
		await expect.poll(() => library.getAttribute('aria-expanded')).toBe('false');
		await expect.poll(() => document.activeElement).toBe(library);
	});

	it('keeps one hidden overflow source node and one separately identified popup node per item', async () => {
		render(NavigationMenuFixture);
		await tick();
		const root = navigation('Overflow navigation');
		const source = root.querySelector<HTMLUListElement>(':scope > ul')!;
		await expect.poll(() => source.dataset.measured).toBe('true');
		const sourceItems = source.querySelectorAll<HTMLLIElement>(':scope > li[data-slot="item"]');
		expect(sourceItems).toHaveLength(5);
		const hidden = [...sourceItems].filter((item) => item.dataset.overflowHidden === 'true');
		expect(hidden.length).toBeGreaterThan(0);
		const hiddenKey = hidden[0]!.dataset.key!;
		const hiddenType = hidden[0]!.dataset.keyType!;
		expect(
			source.querySelectorAll(
				`:scope > li[data-slot="item"][data-key="${hiddenKey}"][data-key-type="${hiddenType}"]`
			)
		).toHaveLength(1);
		expect(hidden[0]?.getAttribute('aria-hidden')).toBe('true');

		const more = source.querySelector<HTMLButtonElement>(
			'button[aria-label="More overflow destinations"]'
		)!;
		await userEvent.click(more);
		await expect.poll(() => more.getAttribute('aria-expanded')).toBe('true');
		const content = document.querySelector<HTMLElement>(
			'[role="dialog"][aria-label="More overflow destinations"]'
		)!;
		const popup = navigation('More overflow destinations', content);
		expect(root.contains(popup)).toBe(false);
		expect(
			popup.querySelectorAll(`li[data-key="${hiddenKey}"][data-key-type="${hiddenType}"]`)
		).toHaveLength(1);
		expect(
			popup.querySelector<HTMLElement>(`li[data-key="${hiddenKey}"][data-key-type="${hiddenType}"]`)
				?.dataset.overflowHidden
		).toBeUndefined();

		const ids = [
			...root.querySelectorAll<HTMLElement>('[id]'),
			content,
			...content.querySelectorAll<HTMLElement>('[id]')
		].map((element) => element.id);
		expect(new Set(ids).size).toBe(ids.length);
	});

	it('removes an opened sibling and all of its descendant keys in single expansion mode', async () => {
		render(NavigationMenuFixture);
		await tick();
		const root = navigation('Single expansion navigation');
		const first = root.querySelector<HTMLButtonElement>(
			'li[data-key="single-a"] > button[data-slot="primary"]'
		)!;
		const descendant = root.querySelector<HTMLButtonElement>(
			'li[data-key="single-a-child"] > button[data-slot="primary"]'
		)!;
		const sibling = root.querySelector<HTMLButtonElement>(
			'li[data-key="single-b"] > button[data-slot="primary"]'
		)!;

		expect(first.getAttribute('aria-expanded')).toBe('true');
		expect(descendant.getAttribute('aria-expanded')).toBe('true');
		expect(sibling.getAttribute('aria-expanded')).toBe('false');
		expect(output('single-navigation-output')).toBe('single-a,single-a-child:0');

		await userEvent.click(sibling);
		await expect.poll(() => output('single-navigation-output')).toBe('single-b:1');
		expect(sibling.getAttribute('aria-expanded')).toBe('true');
		expect(first.getAttribute('aria-expanded')).toBe('false');
		expect(root.querySelector('li[data-key="single-a-child"]')).toBeNull();
		expect(root.querySelector('li[data-key="single-a-leaf"]')).toBeNull();
	});

	it('handles href branch direction keys once and opens ArrowUp on the last panel item', async () => {
		render(NavigationMenuFixture);
		await tick();
		const horizontal = navigation('Horizontal navigation');
		const disclosure = horizontal
			.querySelector<HTMLAnchorElement>('a[href="/products"]')!
			.closest<HTMLElement>('[data-slot="row"]')!
			.querySelector<HTMLButtonElement>('button[data-slot="disclosure"]')!;
		const next = horizontal.querySelector<HTMLAnchorElement>('a[href="/native-modified"]')!;

		disclosure.focus();
		await userEvent.keyboard('{ArrowRight}');
		expect(document.activeElement).toBe(next);
		expect(disclosure.getAttribute('aria-expanded')).toBe('false');
		expect(output('horizontal-open-output')).toBe(':0');

		disclosure.focus();
		await userEvent.keyboard('{ArrowUp}');
		await expect.poll(() => disclosure.getAttribute('aria-expanded')).toBe('true');
		const panel = controlledPanel(disclosure)!;
		await expect
			.poll(() => document.activeElement)
			.toBe(panel.querySelector<HTMLAnchorElement>('a[href="/products/pricing"]'));
		expect(output('horizontal-open-output')).toBe('horizontal-products:1');
	});

	it('moves Tab from the last panel item to the next real document target, skipping inert More', async () => {
		render(NavigationMenuFixture);
		await tick();
		const root = navigation('Panel boundary navigation');
		const source = root.querySelector<HTMLUListElement>(':scope > ul')!;
		await expect.poll(() => source.dataset.measured).toBe('true');
		const disclosure = root.querySelector<HTMLButtonElement>(
			'li[data-key="panel-boundary"] > button[data-slot="primary"]'
		)!;
		const more = source.querySelector<HTMLButtonElement>(
			'button[aria-label="Panel boundary more"]'
		)!;
		const after = document.querySelector<HTMLButtonElement>(
			'[data-testid="panel-boundary-after"]'
		)!;
		expect(more.closest<HTMLElement>('[inert]')).not.toBeNull();

		await userEvent.click(disclosure);
		await expect.poll(() => disclosure.getAttribute('aria-expanded')).toBe('true');
		const panel = controlledPanel(disclosure)!;
		expect(document.activeElement).toBe(
			panel.querySelector<HTMLAnchorElement>('a[href="/panel/first"]')
		);
		await userEvent.keyboard('{End}');
		expect(document.activeElement).toBe(
			panel.querySelector<HTMLAnchorElement>('a[href="/panel/last"]')
		);
		await userEvent.keyboard('{Tab}');
		await expect.poll(() => disclosure.getAttribute('aria-expanded')).toBe('false');
		await expect.poll(() => controlledPanel(disclosure)).toBeNull();
		await tick();
		// Popover FocusScope cleanup must consume the restore target assigned in the
		// same Tab event, after the portalled panel has actually unmounted.
		expect(document.activeElement).toBe(after);
		expect(document.activeElement).not.toBe(disclosure);
	});

	it('pins custom panels and never duplicates consumer item, start, end or panel IDs in More', async () => {
		render(NavigationMenuFixture);
		await tick();
		const root = navigation('Consumer overflow navigation');
		const source = root.querySelector<HTMLUListElement>(':scope > ul')!;
		await expect.poll(() => source.dataset.measured).toBe('true');
		const sourceItems = [
			...source.querySelectorAll<HTMLLIElement>(':scope > li[data-slot="item"]')
		];
		const panelSource = sourceItems.find((item) => item.dataset.key === 'consumer-panel')!;
		const hidden = sourceItems.filter((item) => item.dataset.overflowHidden === 'true');
		expect(panelSource.dataset.overflowHidden).toBeUndefined();
		expect(hidden.length).toBeGreaterThan(0);

		for (const key of ['consumer-panel', 'consumer-one', 'consumer-two', 'consumer-three']) {
			for (const part of ['item', 'start', 'end']) {
				expect(document.querySelectorAll(`[id="consumer-${part}-${key}"]`)).toHaveLength(1);
			}
		}

		const more = source.querySelector<HTMLButtonElement>(
			'button[aria-label="More consumer destinations"]'
		)!;
		await userEvent.click(more);
		await expect.poll(() => more.getAttribute('aria-expanded')).toBe('true');
		const content = document.querySelector<HTMLElement>(
			'[role="dialog"][aria-label="More consumer destinations"]'
		)!;
		const popup = navigation('More consumer destinations', content);
		expect(popup.querySelector('[id^="consumer-item-"]')).toBeNull();
		expect(popup.querySelector('[id^="consumer-start-"]')).toBeNull();
		expect(popup.querySelector('[id^="consumer-end-"]')).toBeNull();
		expect(popup.querySelector('li[data-key="consumer-panel"]')).toBeNull();
		expect(popup.querySelector(`li[data-key="${hidden[0]!.dataset.key}"]`)?.textContent).toContain(
			'Consumer destination'
		);
		expect(document.querySelectorAll('[id="consumer-panel-fixed"]')).toHaveLength(0);

		await userEvent.keyboard('{Escape}');
		await expect.poll(() => more.getAttribute('aria-expanded')).toBe('false');
		const panelDisclosure = panelSource.querySelector<HTMLButtonElement>(
			'button[data-slot="primary"]'
		)!;
		await userEvent.click(panelDisclosure);
		await expect.poll(() => panelDisclosure.getAttribute('aria-expanded')).toBe('true');
		expect(document.querySelectorAll('[id="consumer-panel-fixed"]')).toHaveLength(1);
	});

	it('exposes focus, expand, collapse and close methods and repairs focused data removal', async () => {
		const target = document.createElement('div');
		document.body.append(target);
		const component = mount(NavigationMenuFixture, { target });
		try {
			await tick();
			const inline = navigation('Inline navigation', target);
			const disclosure = inline
				.querySelector<HTMLAnchorElement>('a[href="/projects"]')!
				.closest<HTMLElement>('[data-slot="row"]')!
				.querySelector<HTMLButtonElement>('button[data-slot="disclosure"]')!;

			component.expandInline();
			await expect.poll(() => disclosure.getAttribute('aria-expanded')).toBe('true');
			expect(output('inline-navigation-output', target)).toBe('inline-home|inline-projects|1');
			component.collapseInline();
			await expect.poll(() => disclosure.getAttribute('aria-expanded')).toBe('false');
			expect(output('inline-navigation-output', target)).toBe('inline-home||2');
			component.expandInline();
			await expect.poll(() => disclosure.getAttribute('aria-expanded')).toBe('true');
			component.closeInline();
			await expect.poll(() => disclosure.getAttribute('aria-expanded')).toBe('false');
			expect(output('inline-navigation-output', target)).toBe('inline-home||4');

			component.focusDynamicMiddle();
			const middle = target.querySelector<HTMLAnchorElement>('a[href="/dynamic/middle"]')!;
			await expect.poll(() => document.activeElement).toBe(middle);
			component.removeDynamicMiddle();
			await expect.poll(() => target.querySelector('a[href="/dynamic/middle"]')).toBeNull();
			await expect
				.poll(() => document.activeElement)
				.toBe(target.querySelector<HTMLAnchorElement>('a[href="/dynamic/after"]'));
		} finally {
			await unmount(component);
			target.remove();
		}
	});
});
