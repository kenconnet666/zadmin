import { render } from 'vitest-browser-svelte';
import { describe, expect, it } from 'vitest';
import { mount, tick, unmount } from 'svelte';

import DataTableProductionFixture from './DataTableProductionFixture.svelte';
import DataTableBoundaryFixture from './DataTableBoundaryFixture.svelte';

describe('ZDataTable production contracts', () => {
	it('rejects invalid state keys, column models, sort descriptors and server offsets', async () => {
		render(DataTableBoundaryFixture);
		await tick();
		const output = document.querySelector(
			'[data-testid="data-table-boundary-output"]'
		)?.textContent;
		expect(output).toMatch(/^6:/u);
		expect(output).toContain('state keys must be strings or finite numbers');
		expect(output).toContain('at least one visible data column');
		expect(output).toContain('numeric width when resizable or sticky');
		expect(output).toContain('minWidth cannot exceed maxWidth');
		expect(output).toContain('sort direction must be ascending or descending');
		expect(output).toContain('rowIndexOffset must be a non-negative integer');
	});

	it('keeps typed selection, default sort clearing and expanded relationships controlled', async () => {
		render(DataTableProductionFixture);
		const table = document.querySelector<HTMLElement>('[data-testid="data-table-production"]');
		const output = document.querySelector<HTMLOutputElement>(
			'[data-testid="data-table-production-output"]'
		);
		expect(output?.textContent).toContain('number:1');
		const numericSelection = table?.querySelector<HTMLInputElement>(
			'[aria-label="Select number:1"]'
		);
		expect(numericSelection?.checked).toBe(true);
		expect(table?.querySelector<HTMLInputElement>('[aria-label="Select string:1"]')?.checked).toBe(
			false
		);
		numericSelection?.focus();
		document.querySelector<HTMLButtonElement>('[data-testid="data-table-remove-focused"]')?.click();
		await tick();
		await tick();
		expect(document.activeElement?.getAttribute('aria-label')).toBe('Select string:1');

		const sortButton = [...(table?.querySelectorAll<HTMLButtonElement>('th button') ?? [])].find(
			(button) => button.textContent?.includes('Name')
		);
		sortButton?.click();
		await tick();
		expect(output?.textContent).toContain('name:descending');
		sortButton?.click();
		await tick();
		expect(output?.textContent).toContain('|none|');
		expect(table?.querySelector('tbody tr[data-slot="row"]')?.getAttribute('data-key')).toBe('1');

		const expand = table?.querySelector<HTMLButtonElement>('[data-row-focus="expand"]');
		expand?.click();
		await tick();
		expect(expand?.getAttribute('aria-expanded')).toBe('true');
		expect(document.getElementById(expand?.getAttribute('aria-controls') ?? '')).not.toBeNull();
	});

	it('supports visibility, keyboard resizing, sticky cells and retained async data', async () => {
		render(DataTableProductionFixture);
		const table = document.querySelector<HTMLElement>('[data-testid="data-table-production"]');
		document.querySelector<HTMLButtonElement>('[data-testid="data-table-toggle-owner"]')?.click();
		await tick();
		expect(table?.querySelector('th[data-column-id="owner"]')).not.toBeNull();

		const separator = table?.querySelector<HTMLButtonElement>('[role="separator"]');
		separator?.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowRight' }));
		await tick();
		expect(separator?.getAttribute('aria-valuenow')).toBe('168');
		expect(table?.querySelector('[data-column-id="name"]')?.getAttribute('data-sticky')).toBe(
			'start'
		);

		document.querySelector<HTMLButtonElement>('[data-testid="data-table-loading"]')?.click();
		await tick();
		expect(table?.getAttribute('aria-busy')).toBe('true');
		expect(table?.querySelector('[data-slot="status"]')?.textContent).toContain('Refreshing rows');
		expect(table?.querySelectorAll('tbody tr[data-slot="row"]')).toHaveLength(3);
		document.querySelector<HTMLButtonElement>('[data-testid="data-table-error"]')?.click();
		await tick();
		expect(table?.querySelector('[role="alert"]')?.textContent).toContain('Rows failed');
	});

	it('does not re-sort a server-owned page', () => {
		render(DataTableProductionFixture);
		const table = document.querySelector<HTMLElement>('[data-testid="data-table-server"]');
		expect(table?.querySelector('tbody tr[data-slot="row"]')?.textContent).toContain('Zulu');
		expect(table?.querySelector('th[data-column-id="name"]')?.getAttribute('aria-sort')).toBe(
			'ascending'
		);
	});

	it('keeps the virtual window bounded and mounts a keyed row before focus restoration', async () => {
		render(DataTableProductionFixture);
		const viewport = document.querySelector<HTMLElement>('[data-testid="data-table-virtual"]');
		expect(viewport?.querySelectorAll('tbody tr[data-slot="row"]')?.length).toBeLessThan(12);
		document.querySelector<HTMLButtonElement>('[data-testid="data-table-virtual-focus"]')?.click();
		await tick();
		await Promise.resolve();
		expect(viewport?.querySelector('tr[data-key="virtual-250"]')).not.toBeNull();
		expect(document.activeElement?.getAttribute('data-row-focus')).toBe('selection');
		const before = viewport?.scrollTop ?? 0;
		document
			.querySelector<HTMLButtonElement>('[data-testid="data-table-virtual-prepend"]')
			?.click();
		await tick();
		expect(viewport?.scrollTop).toBeGreaterThanOrEqual(before);
	});

	it('binds virtual measurement and focus work to an iframe owner realm', async () => {
		const frame = document.createElement('iframe');
		document.body.append(frame);
		const frameDocument = frame.contentDocument;
		if (!frameDocument?.body) throw new Error('Missing iframe document.');
		const component = mount(DataTableProductionFixture, { target: frameDocument.body });
		await tick();
		const viewport = frameDocument.querySelector<HTMLElement>('[data-testid="data-table-virtual"]');
		expect(viewport?.ownerDocument).toBe(frameDocument);
		frameDocument
			.querySelector<HTMLButtonElement>('[data-testid="data-table-virtual-focus"]')
			?.click();
		await tick();
		await tick();
		expect(frameDocument.activeElement?.getAttribute('data-row-focus')).toBe('selection');
		await unmount(component);
		frame.remove();
	});
});
