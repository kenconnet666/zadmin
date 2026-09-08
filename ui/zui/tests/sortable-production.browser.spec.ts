import { tick } from 'svelte';
import { describe, expect, it } from 'vitest';
import { commands, userEvent } from 'vitest/browser';

import { mount, unmount } from './browser-lifecycle.js';
import { activateFormReset } from './form-reset.js';
import SortableFormListFixture from './SortableFormListFixture.svelte';
import SortableProductionFixture from './SortableProductionFixture.svelte';

function rows(root: ParentNode): HTMLElement[] {
	return [...root.querySelectorAll<HTMLElement>('[data-slot="row"]')];
}

describe('ZSortable production browser contracts', () => {
	it('preserves typed key snapshots and lets the owner accept action and keyboard moves', async () => {
		const target = document.createElement('div');
		document.body.append(target);
		const component = mount(SortableProductionFixture, { target });
		try {
			await tick();
			const sortable = target.querySelector<HTMLElement>('[data-testid="sortable-production"]')!;
			const firstRow = rows(sortable)[0]!;
			await userEvent.click(firstRow.querySelector<HTMLButtonElement>('[data-slot="move-next"]')!);
			await expect
				.poll(() => component.getItems().map((item) => item.key))
				.toEqual(['0', 0, 'locked', 'tail']);

			const action = component.getRequests()[0]!;
			expect(action.key).toBe(0);
			expect(action.fromIndex).toBe(0);
			expect(action.toIndex).toBe(1);
			expect(action.source).toBe('action');
			expect(action.keys).toEqual([0, '0', 'locked', 'tail']);
			expect(action.nextItems.map((item) => item.key)).toEqual(['0', 0, 'locked', 'tail']);
			expect(Object.isFrozen(action)).toBe(true);
			expect(Object.isFrozen(action.keys)).toBe(true);
			expect(Object.isFrozen(action.nextItems)).toBe(true);
			expect(action.signal.aborted).toBe(false);
			expect(component.getEnds().at(-1)?.result).toBe('accepted');

			component.resetFixture();
			await tick();
			const handle = rows(sortable)[0]!.querySelector<HTMLButtonElement>('[data-slot="handle"]')!;
			handle.focus();
			await userEvent.keyboard(' ');
			await expect.poll(() => sortable.dataset.state).toBe('dragging');
			await userEvent.keyboard('{ArrowDown}');
			await expect.poll(() => rows(sortable)[1]?.dataset.state).toBe('targeted');
			await userEvent.keyboard('{Enter}');
			await expect.poll(() => component.getRequests()).toHaveLength(1);
			expect(component.getRequests()[0]?.source).toBe('keyboard');
			expect(component.getItems().map((item) => item.key)).toEqual(['0', 0, 'locked', 'tail']);
			expect(document.activeElement).toBe(handle);
		} finally {
			await unmount(component);
			target.remove();
		}
	});

	it('uses the real browser mouse path and physical RTL keyboard target geometry', async () => {
		const target = document.createElement('div');
		document.body.append(target);
		const component = mount(SortableProductionFixture, { target });
		try {
			await tick();
			const pointer = target.querySelector<HTMLElement>('[data-testid="sortable-pointer"]')!;
			const pointerRows = rows(pointer);
			expect(pointerRows[0]!.getBoundingClientRect().width).toBeGreaterThan(0);
			expect(pointerRows[1]!.getBoundingClientRect().width).toBeGreaterThan(0);
			await commands.dragElements(
				'[data-testid="sortable-pointer"] [data-slot="row"]:nth-child(1) [data-slot="handle"]',
				'[data-testid="sortable-pointer"] [data-slot="row"]:nth-child(2)'
			);
			await expect
				.poll(() => component.getPointerItems().map((item) => item.key))
				.toEqual(['pointer-b', 'pointer-a', 'pointer-c']);
			expect(component.getPointerSource()).toBe('pointer');

			const rtl = target.querySelector<HTMLElement>('[data-testid="sortable-rtl"]')!;
			const rtlRows = rows(rtl);
			expect(rtl.getAttribute('dir')).toBe('rtl');
			expect(rtlRows[0]!.getBoundingClientRect().left).toBeGreaterThan(
				rtlRows[1]!.getBoundingClientRect().left
			);
			const rtlHandle = rtlRows[0]!.querySelector<HTMLButtonElement>('[data-slot="handle"]')!;
			rtlHandle.focus();
			await userEvent.keyboard(' ');
			await expect.poll(() => rtl.dataset.state).toBe('dragging');
			await userEvent.keyboard('{ArrowLeft}');
			await expect.poll(() => rtlRows[1]?.dataset.state).toBe('targeted');
			await userEvent.keyboard('{Enter}');
			await expect
				.poll(() => component.getRtlItems().map((item) => item.key))
				.toEqual(['rtl-b', 'rtl-a', 'rtl-c']);
			expect(document.activeElement).toBe(rtlHandle);
		} finally {
			await unmount(component);
			target.remove();
		}
	});

	it('finishes an accepted owner move as error when row animation throws and remains reusable', async () => {
		const target = document.createElement('div');
		document.body.append(target);
		const component = mount(SortableProductionFixture, { target });
		try {
			await tick();
			const sortable = target.querySelector<HTMLElement>('[data-testid="sortable-production"]')!;
			const movingRow = rows(sortable)[0]!;
			const ownAnimate = Object.getOwnPropertyDescriptor(movingRow, 'animate');
			const animationError = new Error('sortable animation failed');
			try {
				Object.defineProperty(movingRow, 'animate', {
					configurable: true,
					value: () => {
						throw animationError;
					}
				});
				await userEvent.click(
					movingRow.querySelector<HTMLButtonElement>('[data-slot="move-next"]')!
				);
				await expect.poll(() => component.getEnds().at(-1)?.result).toBe('error');
				expect(component.getEnds().at(-1)?.error).toBe(animationError);
				expect(component.getItems().map((item) => item.key)).toEqual(['0', 0, 'locked', 'tail']);
				expect(sortable.dataset.state).toBe('idle');
				await Promise.resolve();
				await tick();
				expect(component.getEnds()).toHaveLength(1);
			} finally {
				if (ownAnimate) Object.defineProperty(movingRow, 'animate', ownAnimate);
				else Reflect.deleteProperty(movingRow, 'animate');
			}

			await userEvent.click(
				movingRow.querySelector<HTMLButtonElement>('[data-slot="move-previous"]')!
			);
			await expect.poll(() => component.getEnds()).toHaveLength(2);
			expect(component.getEnds().at(-1)?.result).toBe('accepted');
			expect(component.getRequests()).toHaveLength(2);
			expect(component.getItems().map((item) => item.key)).toEqual([0, '0', 'locked', 'tail']);
			expect(sortable.dataset.state).toBe('idle');
		} finally {
			await unmount(component);
			target.remove();
		}
	});

	it('drops in place without owner callbacks or a stale picked-up announcement', async () => {
		const target = document.createElement('div');
		document.body.append(target);
		const component = mount(SortableProductionFixture, { target });
		try {
			await tick();
			const sortable = target.querySelector<HTMLElement>('[data-testid="sortable-production"]')!;
			const handle = rows(sortable)[0]!.querySelector<HTMLButtonElement>('[data-slot="handle"]')!;
			handle.focus();
			await userEvent.keyboard(' ');
			await expect.poll(() => sortable.dataset.state).toBe('dragging');
			const live = [...target.querySelectorAll<HTMLElement>('[role="status"]')].find((element) =>
				element.textContent?.includes('Picked up Numeric zero')
			);
			expect(live).toBeDefined();

			await userEvent.keyboard('{Enter}');
			await expect.poll(() => sortable.dataset.state).toBe('idle');
			expect(component.getRequests()).toHaveLength(0);
			expect(component.getEnds()).toHaveLength(0);
			expect(live?.textContent).not.toContain('Picked up Numeric zero');
			expect(document.activeElement).toBe(handle);
		} finally {
			await unmount(component);
			target.remove();
		}
	});

	it('reports rejection, error, cancellation and stale delayed ownership without mutating previews', async () => {
		const target = document.createElement('div');
		document.body.append(target);
		const component = mount(SortableProductionFixture, { target });
		try {
			await tick();
			const sortable = target.querySelector<HTMLElement>('[data-testid="sortable-production"]')!;
			const next = () =>
				rows(sortable)[0]!.querySelector<HTMLButtonElement>('[data-slot="move-next"]')!;

			component.setPolicy('reject');
			await userEvent.click(next());
			await expect.poll(() => component.getEnds().at(-1)?.result).toBe('rejected');
			expect(component.getItems().map((item) => item.key)).toEqual([0, '0', 'locked', 'tail']);

			component.setPolicy('error');
			await userEvent.click(next());
			await expect.poll(() => component.getEnds().at(-1)?.result).toBe('error');
			expect(component.getEnds().at(-1)?.error).toEqual(
				expect.objectContaining({ message: 'sortable fixture rejection' })
			);

			component.setPolicy('delay');
			await userEvent.click(next());
			await expect.poll(() => sortable.dataset.state).toBe('pending');
			component.settleDelayed(true);
			await expect.poll(() => component.getEnds().at(-1)?.result).toBe('accepted');
			expect(component.getItems().map((item) => item.key)).toEqual(['0', 0, 'locked', 'tail']);

			component.resetFixture();
			component.setPolicy('delay');
			await tick();
			await userEvent.click(next());
			await expect.poll(() => sortable.dataset.state).toBe('pending');
			const cancelled = component.getRequests().at(-1)!;
			component.setReadonly(true);
			await expect.poll(() => component.getEnds().at(-1)?.result).toBe('cancelled');
			expect(cancelled.signal.aborted).toBe(true);
			expect(sortable.dataset.state).toBe('idle');
			expect(sortable.dataset.readonly).toBe('true');
			expect(rows(sortable).every((row) => row.dataset.readonly === 'true')).toBe(true);
			expect(rows(sortable).every((row) => !row.hasAttribute('aria-disabled'))).toBe(true);
			expect(
				rows(sortable).every(
					(row) => row.querySelector<HTMLButtonElement>('[data-slot="handle"]')?.disabled
				)
			).toBe(true);
			expect(
				rows(sortable).every(
					(row) => row.querySelector<HTMLButtonElement>('[data-slot="move-next"]')?.disabled
				)
			).toBe(true);

			component.setReadonly(false);
			await tick();
			await userEvent.click(next());
			await expect.poll(() => sortable.dataset.state).toBe('pending');
			const stale = component.getRequests().at(-1)!;
			component.deleteItem('tail');
			await expect.poll(() => component.getEnds().at(-1)?.result).toBe('stale');
			expect(stale.signal.aborted).toBe(true);
			expect(sortable.dataset.state).toBe('idle');

			component.resetFixture();
			component.setPolicy('delay');
			await tick();
			await userEvent.click(next());
			await expect.poll(() => sortable.dataset.state).toBe('pending');
			const disabledSource = component.getRequests().at(-1)!;
			component.lockItem(0);
			await expect.poll(() => component.getEnds().at(-1)?.result).toBe('cancelled');
			expect(disabledSource.signal.aborted).toBe(true);
			expect(rows(sortable)[0]?.dataset.disabled).toBe('true');
		} finally {
			await unmount(component);
			target.remove();
		}
	});

	it('cancels an active preview for external reorder and reacts to disabled and reduced motion', async () => {
		const target = document.createElement('div');
		document.body.append(target);
		const component = mount(SortableProductionFixture, { target });
		try {
			await tick();
			const sortable = target.querySelector<HTMLElement>('[data-testid="sortable-production"]')!;
			const handle = rows(sortable)[0]!.querySelector<HTMLButtonElement>('[data-slot="handle"]')!;
			handle.focus();
			await userEvent.keyboard(' ');
			await expect.poll(() => sortable.dataset.state).toBe('dragging');
			await userEvent.keyboard('{Escape}');
			await expect.poll(() => sortable.dataset.state).toBe('idle');
			expect(component.getRequests()).toHaveLength(0);
			expect(document.activeElement).toBe(handle);

			handle.focus();
			await userEvent.keyboard(' ');
			await expect.poll(() => sortable.dataset.state).toBe('dragging');
			component.reverseItems();
			await expect.poll(() => sortable.dataset.state).toBe('idle');
			expect(component.getRequests()).toHaveLength(0);

			component.setDisabled(true);
			await tick();
			expect(sortable.dataset.disabled).toBe('true');
			expect(
				rows(sortable).every(
					(row) => row.querySelector<HTMLButtonElement>('[data-slot="handle"]')?.disabled
				)
			).toBe(true);

			component.setReduced(true);
			await expect.poll(() => sortable.dataset.reducedMotion).toBe('true');
			expect(getComputedStyle(rows(sortable)[0]!).transitionDuration).toBe('0s');
			component.setReduced(false);
			await expect.poll(() => sortable.hasAttribute('data-reduced-motion')).toBe(false);
		} finally {
			await unmount(component);
			target.remove();
		}
	});

	it('composes with the real FormList owner while preserving identity, values, state, focus and reset', async () => {
		const target = document.createElement('div');
		document.body.append(target);
		const component = mount(SortableFormListFixture, { target });
		try {
			await tick();
			const sortable = target.querySelector<HTMLElement>('[data-testid="sortable-form-rows"]')!;
			const baselineRows = rows(sortable);
			const baselineIds = baselineRows.map((row) => row.id);
			const firstInput = baselineRows[0]!.querySelector<HTMLInputElement>('input')!;
			const firstHandle =
				baselineRows[0]!.querySelector<HTMLButtonElement>('[data-slot="handle"]')!;
			await userEvent.fill(firstInput, 'Edited alpha');
			component.seedState();
			expect(component.fieldState(0)?.errors).toEqual(['Sortable server error']);
			expect(component.fieldState(0)?.warnings).toEqual(['Sortable warning']);
			expect(component.fieldState(0)?.dirty).toBe(true);
			expect(component.formState()?.dirty).toBe(true);

			firstHandle.focus();
			await userEvent.keyboard(' ');
			await expect.poll(() => sortable.dataset.state).toBe('dragging');
			await userEvent.keyboard('{ArrowDown}');
			await expect.poll(() => baselineRows[1]?.dataset.state).toBe('targeted');
			await userEvent.keyboard('{Enter}');
			await expect.poll(() => rows(sortable)[1]).toBe(baselineRows[0]);
			expect(rows(sortable)).toEqual([baselineRows[1], baselineRows[0], baselineRows[2]]);
			expect(document.activeElement).toBe(firstInput);
			expect(rows(sortable)[1]!.querySelector('input')).toBe(firstInput);
			expect(firstInput.value).toBe('Edited alpha');
			expect(component.fieldState(1)?.errors).toEqual(['Sortable server error']);
			expect(component.fieldState(1)?.warnings).toEqual(['Sortable warning']);
			expect(component.fieldState(1)?.dirty).toBe(true);
			expect(target.querySelector('[data-testid="sortable-form-request"]')?.textContent).toBe(
				'keyboard:0:1'
			);

			const form = target.querySelector<HTMLFormElement>('[data-testid="sortable-form"]')!;
			const nativeRows = [...new FormData(form).entries()]
				.filter(([name]) => name.startsWith('rows['))
				.map(([, value]) => value);
			expect(nativeRows).toEqual(['Beta', 'Edited alpha', 'Gamma']);

			await activateFormReset(form);
			await expect
				.poll(() => component.values().rows.map((row) => row.name))
				.toEqual(['Alpha', 'Beta', 'Gamma']);
			expect(rows(sortable).map((row) => row.id)).toEqual(baselineIds);
			expect(rows(sortable)).toEqual(baselineRows);
			expect(component.formState()?.dirty).toBe(false);
			expect(new FormData(form).get('rows[0].name')).toBe('Alpha');

			component.setReorderReadonly(true);
			await tick();
			expect(firstHandle.disabled).toBe(true);
			expect(firstInput.disabled).toBe(false);
			expect(firstInput.closest('[aria-disabled="true"]')).toBeNull();
			await userEvent.fill(firstInput, 'Editable while order is readonly');
			expect(new FormData(form).get('rows[0].name')).toBe('Editable while order is readonly');
			expect(rows(sortable)).toEqual(baselineRows);
		} finally {
			await unmount(component);
			target.remove();
		}
	});

	// @zui-visual ZSortable five-size row and handle geometry
	it('renders ICSS-owned five-size geometry without inline style escape hatches', async () => {
		const target = document.createElement('div');
		document.body.append(target);
		const component = mount(SortableProductionFixture, { target });
		try {
			await tick();
			const expected = [
				['xsmall', 24, 11],
				['small', 28, 12],
				['medium', 32, 14],
				['large', 40, 16],
				['xlarge', 48, 16]
			] as const;
			let previousRowHeight = 0;
			for (const [size, handleHeight, fontSize] of expected) {
				const sortable = target.querySelector<HTMLElement>(
					`[data-testid="sortable-scale-${size}"]`
				)!;
				const row = rows(sortable)[0]!;
				const handle = row.querySelector<HTMLButtonElement>('[data-slot="handle"]')!;
				const rowStyle = getComputedStyle(row);
				const handleRect = handle.getBoundingClientRect();
				const rowRect = row.getBoundingClientRect();
				expect(sortable.hasAttribute('style')).toBe(false);
				expect(row.hasAttribute('style')).toBe(false);
				expect(handle.hasAttribute('style')).toBe(false);
				expect(handleRect.height).toBeCloseTo(handleHeight, 1);
				expect(handleRect.width).toBeCloseTo(handleHeight, 1);
				expect(rowStyle.fontSize).toBe(`${fontSize}px`);
				expect(rowRect.height).toBeGreaterThanOrEqual(handleRect.height);
				expect(rowRect.height).toBeGreaterThan(previousRowHeight);
				expect(rowRect.width).toBeGreaterThan(handleRect.width * 2);
				previousRowHeight = rowRect.height;
			}
		} finally {
			await unmount(component);
			target.remove();
		}
	});
});
