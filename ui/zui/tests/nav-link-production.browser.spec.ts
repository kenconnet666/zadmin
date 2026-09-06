import { tick } from 'svelte';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';

import NavLinkProductionFixture from './NavLinkProductionFixture.svelte';

function output(): string {
	return document.querySelector('[data-testid="nav-link-output"]')?.textContent?.trim() ?? '';
}

describe('ZNavLink production contract', () => {
	it('keeps anchor navigation attributes and forwards modified native clicks to the primary once', async () => {
		render(NavLinkProductionFixture);
		const anchor = document.querySelector<HTMLAnchorElement>('.consumer-nav-link')!;
		const row = anchor.closest<HTMLElement>('[data-slot="row"]')!;
		expect(anchor.tagName).toBe('A');
		expect(anchor.getAttribute('href')).toBe('#projects');
		expect(anchor.target).toBe('_blank');
		expect(new Set(anchor.rel.split(/\s+/u))).toEqual(new Set(['help', 'noopener', 'noreferrer']));
		expect(anchor.getAttribute('aria-current')).toBe('page');
		expect(anchor.getAttribute('aria-label')).toBe('Projects');
		expect(anchor.querySelector('[data-testid="rich-label"]')?.textContent).toBe('Project catalog');
		expect(anchor.dataset.owner).toBe('consumer');
		expect(anchor.style.getPropertyValue('--consumer-marker')).toBe('ready');
		expect(row.dataset.owner).toBeUndefined();
		expect(row.querySelector('a button')).toBeNull();

		anchor.dispatchEvent(
			new MouseEvent('click', { bubbles: true, button: 0, cancelable: true, ctrlKey: true })
		);
		await tick();
		expect(output()).toContain('|0:true:false|A:BUTTON|BUTTON:BUTTON');
	});

	it('keeps navigation and disclosure as sibling controls with stable focus and relations', async () => {
		render(NavLinkProductionFixture);
		const anchor = document.querySelector<HTMLAnchorElement>('.consumer-nav-link')!;
		const disclosure = anchor
			.closest('[data-slot="row"]')!
			.querySelector<HTMLButtonElement>('[data-slot="disclosure"]')!;
		expect(disclosure.getAttribute('aria-controls')).toBe('projects-panel');
		expect(disclosure.getAttribute('aria-expanded')).toBe('false');
		expect(disclosure.getAttribute('aria-label')).toBe('Toggle project sections');
		disclosure.focus();
		disclosure.dispatchEvent(
			new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'ArrowRight' })
		);
		await tick();
		expect(disclosure.getAttribute('aria-expanded')).toBe('true');
		expect(document.activeElement).toBe(disclosure);
		expect(output()).toContain('anchor:true');
		disclosure.dispatchEvent(
			new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'ArrowLeft' })
		);
		await tick();
		expect(disclosure.getAttribute('aria-expanded')).toBe('false');
		expect(document.activeElement).toBe(disclosure);
	});

	it('uses one native button as both the primary and disclosure when href is absent', async () => {
		render(NavLinkProductionFixture);
		const button = document.querySelector<HTMLButtonElement>('[aria-controls="settings-panel"]')!;
		expect(button.tagName).toBe('BUTTON');
		expect(button.getAttribute('aria-expanded')).toBe('false');
		button.click();
		await tick();
		expect(button.getAttribute('aria-expanded')).toBe('true');
		expect(output()).toContain('button:true');
		expect(output()).toContain('|A:BUTTON|BUTTON:BUTTON');
	});

	it('uses rendered RTL direction for disclosure arrow keys', async () => {
		render(NavLinkProductionFixture);
		const disclosure = document.querySelector<HTMLButtonElement>('[aria-controls="rtl-panel"]')!;
		disclosure.dispatchEvent(
			new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'ArrowLeft' })
		);
		await tick();
		expect(disclosure.getAttribute('aria-expanded')).toBe('true');
		disclosure.dispatchEvent(
			new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'ArrowRight' })
		);
		await tick();
		expect(disclosure.getAttribute('aria-expanded')).toBe('false');
	});

	it('retains compact accessible names and a visible fallback while hiding text beside a start icon', () => {
		render(NavLinkProductionFixture);
		const fallback = document.querySelector<HTMLElement>('[data-testid="compact-fallback"]')!;
		const icon = document.querySelector<HTMLElement>('[data-testid="compact-icon"]')!;
		expect(fallback.getAttribute('aria-label')).toBe('Analytics');
		expect(fallback.querySelector('[data-slot="compact-fallback"]')?.textContent).toBe('A');
		expect(icon.getAttribute('aria-label')).toBe('Notifications');
		expect(icon.querySelector('[data-testid="nav-start"]')).not.toBeNull();
		expect(icon.querySelector('[data-slot="label"]')).toBeNull();
	});

	it('exposes all five resolved sizes with increasing primary geometry', () => {
		render(NavLinkProductionFixture);
		const heights = [
			['xsmall', '11px'],
			['small', '11px'],
			['medium', '12px'],
			['large', '14px'],
			['xlarge', '16px']
		].map(([size, descriptionFontSize]) => {
			const link = document.querySelector<HTMLElement>(`[data-testid="size-${size}"]`)!;
			const description = document.querySelector<HTMLElement>(
				`[data-testid="description-${size}"]`
			)!;
			const compact = document.querySelector<HTMLElement>(`[data-testid="compact-${size}"]`)!;
			expect(link.dataset.size).toBe(size);
			expect(description.scrollHeight).toBeLessThanOrEqual(description.clientHeight + 1);
			expect(
				getComputedStyle(description.querySelector<HTMLElement>('[data-slot="description"]')!)
					.fontSize
			).toBe(descriptionFontSize);
			expect(description.getBoundingClientRect().height).toBeGreaterThan(
				link.getBoundingClientRect().height
			);
			expect(getComputedStyle(compact).boxSizing).toBe('border-box');
			expect(compact.getBoundingClientRect().width).toBeCloseTo(
				compact.getBoundingClientRect().height,
				0
			);
			return link.getBoundingClientRect().height;
		});
		expect(heights.every((height, index) => index === 0 || height > heights[index - 1]!)).toBe(
			true
		);
	});

	it('keeps disabled link and disclosure independently exposed but non-actionable', () => {
		render(NavLinkProductionFixture);
		const primary = document.querySelector<HTMLElement>('[data-testid="disabled-link"]')!;
		const disclosure = primary
			.closest('[data-slot="row"]')!
			.querySelector<HTMLButtonElement>('[data-slot="disclosure"]')!;
		expect(primary.getAttribute('aria-disabled')).toBe('true');
		expect(primary.hasAttribute('href')).toBe(false);
		expect(primary.getAttribute('aria-current')).toBeNull();
		expect(disclosure.disabled).toBe(true);
		expect(disclosure.getAttribute('aria-expanded')).toBe('false');
	});
});
