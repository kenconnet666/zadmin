import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';

import AppShellFixture from './AppShellFixture.svelte';

let originalViewport: { height: number; width: number };
beforeEach(async () => {
	originalViewport = { height: window.innerHeight, width: window.innerWidth };
	await page.viewport(1024, 768);
});
afterEach(async () => {
	await page.viewport(originalViewport.width, originalViewport.height);
});

describe('ZAppShell production contract', () => {
	it('keeps native regions in deterministic grid offsets and gives main the bounded scroll owner', () => {
		// @zui-visual ZAppShell native region geometry and bounded main scrolling
		render(AppShellFixture);
		const shell = document.querySelector<HTMLElement>('[data-testid="app-shell-default"]')!;
		const header = shell.querySelector<HTMLElement>('[data-region="header"]')!;
		const navbar = shell.querySelector<HTMLElement>('[data-region="navbar"]')!;
		const main = shell.querySelector<HTMLElement>('[data-region="main"]')!;
		const aside = shell.querySelector<HTMLElement>('[data-region="aside"]')!;
		const footer = shell.querySelector<HTMLElement>('[data-region="footer"]')!;
		expect(shell.tagName).toBe('DIV');
		expect(header.tagName).toBe('HEADER');
		expect(navbar.tagName).toBe('NAV');
		expect(main.tagName).toBe('MAIN');
		expect(aside.tagName).toBe('ASIDE');
		expect(footer.tagName).toBe('FOOTER');
		expect(getComputedStyle(shell).display).toBe('grid');
		expect(getComputedStyle(shell).overflow).toBe('hidden');
		expect(getComputedStyle(main).overflow).toBe('auto');
		expect(main.tabIndex).toBe(0);
		expect(navbar.tabIndex).toBe(0);
		expect(aside.tabIndex).toBe(0);
		expect(main.getBoundingClientRect().top).toBeGreaterThanOrEqual(
			header.getBoundingClientRect().bottom
		);
		expect(main.getBoundingClientRect().left).toBeGreaterThanOrEqual(
			navbar.getBoundingClientRect().right
		);
		expect(main.getBoundingClientRect().right).toBeLessThanOrEqual(
			aside.getBoundingClientRect().left
		);
		expect(main.getBoundingClientRect().bottom).toBeLessThanOrEqual(
			footer.getBoundingClientRect().top
		);
		expect(main.scrollHeight).toBeGreaterThan(main.clientHeight);
	});

	it('supports alternative regions, responsive collapsed base state, root scrolling and RTL without DOM reordering', async () => {
		await page.viewport(390, 844);
		render(AppShellFixture);
		const alternative = document.querySelector<HTMLElement>(
			'[data-testid="app-shell-alternative"]'
		)!;
		const alternativeMain = alternative.querySelector<HTMLElement>('[data-region="main"]')!;
		const alternativeFooter = alternative.querySelector<HTMLElement>('[data-region="footer"]')!;
		const rtl = document.querySelector<HTMLElement>('[data-testid="app-shell-rtl"]')!;
		expect(alternative.dataset.layout).toBe('alternative');
		expect(alternative.dataset.mainAs).toBe('div');
		expect(alternative.dataset.scroll).toBe('root');
		expect(alternative.dataset.navbarCollapsed).toBe('true');
		expect(alternative.querySelector('[data-region="navbar"]')).not.toBeNull();
		expect(
			getComputedStyle(alternative.querySelector<HTMLElement>('[data-region="navbar"]')!).display
		).toBe('none');
		expect(
			getComputedStyle(alternative.querySelector<HTMLElement>('[data-region="aside"]')!).display
		).toBe('none');
		expect(alternative.scrollWidth).toBeLessThanOrEqual(alternative.clientWidth + 1);
		expect(getComputedStyle(alternative).overflow).toBe('auto');
		expect(alternative.tabIndex).toBe(0);
		expect(getComputedStyle(alternativeMain).overflow).toBe('visible');
		expect(alternative.scrollHeight).toBeGreaterThan(alternative.clientHeight);
		expect(alternativeMain.scrollHeight).toBe(alternativeMain.clientHeight);
		expect(alternativeFooter.offsetTop).toBeGreaterThanOrEqual(
			alternativeMain.offsetTop + alternativeMain.scrollHeight
		);
		expect(getComputedStyle(rtl).direction).toBe('rtl');
		expect([...rtl.children].map((child) => child.getAttribute('data-region'))).toEqual([
			'header',
			'navbar',
			'main',
			'aside'
		]);
	});

	it('consumes dedicated AppShell purpose tokens instead of generic control or menu dimensions', () => {
		render(AppShellFixture);
		const shell = document.querySelector<HTMLElement>('[data-testid="app-shell-theme-defaults"]')!;
		const header = shell.querySelector<HTMLElement>('[data-region="header"]')!;
		const navbar = shell.querySelector<HTMLElement>('[data-region="navbar"]')!;
		const aside = shell.querySelector<HTMLElement>('[data-region="aside"]')!;
		const footer = shell.querySelector<HTMLElement>('[data-region="footer"]')!;
		expect(header.getBoundingClientRect().height).toBe(56);
		expect(footer.getBoundingClientRect().height).toBe(40);
		expect(navbar.getBoundingClientRect().width).toBe(240);
		expect(aside.getBoundingClientRect().width).toBe(240);
		expect(navbar.getAttribute('aria-label')).toBe('Primary navigation');
		expect(
			document
				.querySelector<HTMLElement>('[data-testid="app-shell-localized"] [data-region="navbar"]')
				?.getAttribute('aria-label')
		).toBe('主导航');
	});
});
