import { tick } from 'svelte';
import { describe, expect, it } from 'vitest';
import type { DataTableColumnVisibility, DataTableColumnWidths } from '../src/entrypoints/index.js';
import { mount, unmount } from './browser-lifecycle.js';
import DataTableColumnStateFixture from './DataTableColumnStateFixture.svelte';

describe('ZDataTable column state ownership', () => {
	it('guards unknown/no-op changes and the last visible column within one synchronous sequence', async () => {
		const target = document.createElement('div');
		document.body.append(target);
		const component = mount(DataTableColumnStateFixture, { target });
		try {
			await tick();
			const controller = component.columnState().controller!;
			const initial = controller.visibleColumnIds;
			expect(initial).toEqual(['name']);
			expect(Object.isFrozen(initial)).toBe(true);
			expect(controller.setColumnVisible('missing', true)).toBe(false);
			expect(controller.setColumnVisible('name', true)).toBe(false);
			expect(controller.setColumnVisible('name', false)).toBe(false);
			expect(component.columnState().visibilityChanges).toEqual([]);

			expect(controller.setColumnVisible('constructor', true)).toBe(true);
			expect(controller.setColumnVisible('constructor', true)).toBe(false);
			expect(controller.setColumnVisible('name', false)).toBe(true);
			expect(controller.setColumnVisible('constructor', false)).toBe(false);
			await tick();
			expect(controller.visibleColumnIds).toEqual(['constructor']);
			expect(initial).toEqual(['name']);
			expect(component.columnState().visibilityChanges).toEqual([
				{ ['constructor']: true },
				{ ['constructor']: true, name: false }
			]);
			expect(Object.isFrozen(component.columnState().visibilityChanges[1])).toBe(true);
			expect(target.querySelector('th[data-column-id="constructor"]')).not.toBeNull();
			expect(target.querySelector('th[data-column-id="name"]')).toBeNull();
		} finally {
			await unmount(component);
			target.remove();
		}
	});

	it('ignores inherited visibility/width values while honoring own prototype-like keys', async () => {
		const target = document.createElement('div');
		document.body.append(target);
		const component = mount(DataTableColumnStateFixture, { target });
		try {
			await tick();
			const visibility: Record<string, boolean> = {};
			const widths: Record<string, number> = {};
			Object.setPrototypeOf(visibility, { name: false, ['constructor']: true });
			Object.setPrototypeOf(widths, { name: 288 });
			component.synchronizeColumns(visibility, widths);
			await tick();
			expect(component.columnState().controller!.visibleColumnIds).toEqual(['name']);
			expect(
				target.querySelector('[data-slot="column-resizer"]')?.getAttribute('aria-valuenow')
			).toBe('160');
			expect(component.columnState().visibilityChanges).toEqual([]);
			expect(component.columnState().widthChanges).toEqual([]);

			const ownedVisibility: DataTableColumnVisibility = {
				['constructor']: true,
				['toString']: true,
				['__proto__']: true
			};
			const ownedWidths: DataTableColumnWidths = {
				['constructor']: 208,
				['toString']: 216,
				['__proto__']: 224
			};
			component.synchronizeColumns(ownedVisibility, ownedWidths);
			await tick();
			expect(component.columnState().controller!.visibleColumnIds).toEqual([
				'name',
				'constructor',
				'toString',
				'__proto__'
			]);
			for (const [id, width] of Object.entries(ownedWidths)) {
				const separator = target.querySelector<HTMLButtonElement>(
					`th[data-column-id="${id}"] [data-slot="column-resizer"]`
				)!;
				expect(separator.getAttribute('aria-valuenow')).toBe(String(width));
				separator.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowRight' }));
				await tick();
				expect(component.columnState().widths[id]).toBe(width + 8);
			}
			expect(Object.getPrototypeOf(component.columnState().widths)).toBe(Object.prototype);
			expect(
				Object.prototype.hasOwnProperty.call(component.columnState().widths, '__proto__')
			).toBe(true);
			expect(component.columnState().widthChanges).toHaveLength(3);
			expect(component.columnState().visibilityChanges).toEqual([]);
		} finally {
			await unmount(component);
			target.remove();
		}
	});
});
