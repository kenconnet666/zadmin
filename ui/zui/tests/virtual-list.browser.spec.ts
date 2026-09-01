import { render } from 'vitest-browser-svelte';
import { describe, expect, it } from 'vitest';
import { tick } from 'svelte';
import { mount, unmount } from './browser-lifecycle.js';

import VirtualListFixture from './VirtualListFixture.svelte';
import VirtualListBoundaryFixture from './VirtualListBoundaryFixture.svelte';

describe('ZVirtualList', () => {
	it('reports invalid size, identity, semantic and initial-position contracts', async () => {
		render(VirtualListBoundaryFixture);
		await tick();
		await Promise.resolve();
		const output = document.querySelector('[data-testid="virtual-boundary-output"]')?.textContent;
		expect(output).toMatch(/^10:/u);
		expect(output).toContain('Virtualizer itemSize');
		expect(output).toContain('itemSize and estimateSize are mutually exclusive');
		expect(output).toContain('initialIndex and initialKey are mutually exclusive');
		expect(output).toContain('requires aria-label or aria-labelledby');
		expect(output).toContain('requires itemRole="listitem" or "presentation"');
		expect(output).toContain('itemSelected requires itemRole="option"');
		expect(output).toContain('tree metadata callbacks require itemRole="treeitem"');
		expect(output).toContain('itemId must return unique non-empty ids');
		expect(output).toContain('estimate for string:"one"');
		expect(output).toContain('initialKey does not exist');
	});

	it('measures variable rows and keeps the DOM window bounded', async () => {
		render(VirtualListFixture);
		const viewport = document.querySelector<HTMLDivElement>('[data-testid="virtual-dynamic"]');
		expect(viewport?.dataset.dynamic).toBe('true');
		expect(viewport?.dataset.reducedMotion).toBe('true');
		await expect
			.poll(() => viewport?.querySelectorAll('[data-measured="true"]').length ?? 0)
			.toBeGreaterThan(0);
		expect(viewport?.querySelectorAll('[role="option"]').length).toBeLessThan(20);
		expect(viewport?.querySelector('[aria-disabled="true"]')?.textContent).toContain(
			'Dynamic row 3'
		);
		expect(
			document
				.querySelector('[data-testid="virtual-unselected"] [role="option"]')
				?.getAttribute('aria-selected')
		).toBe('false');
	});

	it('provides an active-descendant mount handshake and reduced-motion scrolling', async () => {
		render(VirtualListFixture);
		const viewport = document.querySelector<HTMLDivElement>('[data-testid="virtual-dynamic"]');
		document.querySelector<HTMLButtonElement>('[data-testid="virtual-activate"]')?.click();
		await tick();
		await expect
			.poll(() => document.querySelector('[data-testid="virtual-active-output"]')?.textContent)
			.toBe('row-199:virtual-option-200');
		expect(document.querySelector('#virtual-option-200')).not.toBeNull();
		expect(
			document
				.querySelector('[data-testid="virtual-focus-owner"]')
				?.getAttribute('aria-activedescendant')
		).toBe('virtual-option-200');

		document.querySelector<HTMLButtonElement>('[data-testid="virtual-smooth"]')?.click();
		await tick();
		expect(Number(viewport?.dataset.visibleStart)).toBeGreaterThan(90);
		expect(viewport?.textContent).toContain('Dynamic row 100');
		expect(document.querySelector('[data-testid="virtual-active-output"]')?.textContent).toBe(
			'row-199:unmounted'
		);
	});

	it('preserves the visible keyed anchor across prepends', async () => {
		render(VirtualListFixture);
		const viewport = document.querySelector<HTMLDivElement>('[data-testid="virtual-dynamic"]');
		if (!viewport) throw new Error('Missing virtual viewport.');
		viewport.scrollTop = 1600;
		viewport.dispatchEvent(new Event('scroll'));
		await tick();
		const before = viewport.dataset.visibleStart;
		const beforeText = viewport.querySelector('[role="option"]')?.textContent?.trim();
		document.querySelector<HTMLButtonElement>('[data-testid="virtual-prepend"]')?.click();
		await tick();
		expect(viewport.querySelector('[role="option"]')?.textContent?.trim()).toBe(beforeText);
		expect(Number(viewport.dataset.visibleStart)).toBe(Number(before) + 1);
	});

	it('distinguishes loading and empty states without fake collection items', async () => {
		render(VirtualListFixture);
		const viewport = document.querySelector<HTMLDivElement>('[data-testid="virtual-state"]');
		expect(viewport?.getAttribute('aria-busy')).toBe('true');
		expect(viewport?.querySelector('[data-slot="loading"]')?.textContent).toContain('Loading');
		expect(viewport?.querySelectorAll('[role="listitem"]')).toHaveLength(0);
		document.querySelector<HTMLButtonElement>('[data-testid="virtual-state-toggle"]')?.click();
		await tick();
		expect(viewport?.hasAttribute('aria-busy')).toBe(false);
		expect(viewport?.querySelector('[data-slot="empty"]')?.textContent).toContain('No deployment');
	});

	it('binds observers and mounted ids to the target iframe realm', async () => {
		const frame = document.createElement('iframe');
		document.body.append(frame);
		const frameDocument = frame.contentDocument;
		if (!frameDocument?.body) throw new Error('Missing iframe document.');
		const component = mount(VirtualListFixture, { target: frameDocument.body });
		await tick();
		const viewport = frameDocument.querySelector<HTMLDivElement>('[data-testid="virtual-dynamic"]');
		expect(viewport?.ownerDocument).toBe(frameDocument);
		frameDocument.querySelector<HTMLButtonElement>('[data-testid="virtual-activate"]')?.click();
		await tick();
		await expect
			.poll(() => frameDocument.querySelector('[data-testid="virtual-active-output"]')?.textContent)
			.toBe('row-199:virtual-option-200');
		expect(frameDocument.querySelector('#virtual-option-200')).not.toBeNull();
		await unmount(component);
		frame.remove();
	});
});
