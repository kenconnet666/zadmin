import { tick } from 'svelte';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';

import InputFiveSizesFixture from './InputFiveSizesFixture.svelte';

const rows = [
	['xsmall', 24],
	['small', 28],
	['medium', 32],
	['large', 40],
	['xlarge', 48]
] as const;

describe('five input sizes', () => {
	it('keeps compound outer rows aligned after accounting for their border', async () => {
		// @zui-visual ZInput ZInputGroup ZNumberField ZDateField ZTimeField ZDatePicker ZDateRangePicker ZPinInput geometry
		render(InputFiveSizesFixture);
		await tick();
		for (const [size, height] of rows) {
			const row = document.querySelector<HTMLElement>(`[data-testid="size-${size}"]`)!;
			for (const id of ['input', 'group', 'number', 'date', 'time']) {
				const control = row.querySelector<HTMLElement>(`[data-testid="${id}"]`)!;
				expect(control.getBoundingClientRect().height, `${id} ${size}`).toBeCloseTo(height, 1);
			}
			for (const id of ['picker', 'range']) {
				const group = row.querySelector<HTMLElement>(`[data-testid="${id}"] > div`)!;
				expect(group.getBoundingClientRect().height, `${id} ${size}`).toBeCloseTo(height, 1);
			}
			const pin = row.querySelector<HTMLElement>('[data-testid="pin"] input')!;
			expect(pin.getBoundingClientRect().height).toBeCloseTo(height, 1);
			expect(pin.getBoundingClientRect().width).toBeCloseTo(height, 1);
			const calendarCell = row.querySelector<HTMLElement>('[data-testid="calendar"] tbody button')!;
			expect(calendarCell.getBoundingClientRect().height).toBeCloseTo(height, 1);
			expect(calendarCell.getBoundingClientRect().width).toBeCloseTo(height, 1);
			const weekday = row.querySelector<HTMLElement>('[data-testid="calendar"] thead th')!;
			expect(weekday.getBoundingClientRect().width).toBeCloseTo(height, 1);
		}
	});

	it('scales inner tags and actions while virtual row height remains independent', async () => {
		// @zui-visual ZTagsInput ZMultiSelect ZFileUpload ZTransfer inner control geometry
		render(InputFiveSizesFixture);
		await tick();
		for (const [size, height] of rows) {
			const row = document.querySelector<HTMLElement>(`[data-testid="size-${size}"]`)!;
			for (const id of ['tags', 'multi']) {
				const owner = row.querySelector(`[data-testid="${id}"]`)!;
				for (const tag of owner.querySelectorAll('[data-slot="tag"], [data-slot="overflow"]')) {
					expect(tag.getAttribute('data-size')).toBe(size);
				}
			}
			const uploadAction = row.querySelector<HTMLElement>(
				'[data-testid="upload"] [data-slot="actions"] > button'
			)!;
			expect(uploadAction.getBoundingClientRect().height).toBeCloseTo(height, 1);
			const transfer = row.querySelector('[data-testid="transfer"]')!;
			for (const input of transfer.querySelectorAll<HTMLInputElement>('input[type="text"]')) {
				expect(input.getBoundingClientRect().height).toBeCloseTo(height, 1);
			}
			for (const action of transfer.querySelectorAll('[data-slot="controls"] > button')) {
				expect(action.getBoundingClientRect().height).toBeCloseTo(height, 1);
			}
		}
	});

	it('keeps switch thumb end gaps symmetric in actual LTR and RTL DOM', async () => {
		// @zui-visual ZSwitch five track and thumb sizes, endpoint geometry and RTL
		render(InputFiveSizesFixture, { mode: 'switch' });
		await tick();
		const metrics = {
			xsmall: [28, 16, 12, 2],
			small: [32, 18, 14, 3],
			medium: [40, 22, 18, 3],
			large: [48, 26, 22, 3],
			xlarge: [56, 30, 26, 3]
		} as const;
		for (const direction of ['ltr', 'rtl'] as const) {
			for (const [size] of rows) {
				const [width, height, diameter, inset] = metrics[size];
				for (const checked of [false, true]) {
					const input = document.querySelector<HTMLInputElement>(
						`[data-testid="switch-${direction}-${size}-${checked}"]`
					)!;
					const track = input.parentElement!.getBoundingClientRect();
					const thumb = input
						.parentElement!.querySelector('[data-slot="thumb"]')!
						.getBoundingClientRect();
					expect(track.width).toBe(width);
					expect(track.height).toBe(height);
					expect(thumb.width).toBe(diameter);
					expect(thumb.height).toBe(diameter);
					expect(thumb.top - track.top).toBe(2);
					expect(track.bottom - thumb.bottom).toBe(2);
					const onRight = direction === 'ltr' ? checked : !checked;
					expect(onRight ? track.right - thumb.right : thumb.left - track.left).toBe(inset);
				}
			}
		}
	});

	it('forwards TreeSelect virtual dimensions through its renamed public props', async () => {
		render(InputFiveSizesFixture, { mode: 'virtual-tree' });
		await tick();
		const tree = document.querySelector<HTMLElement>('[role="tree"]')!;
		expect(tree.getBoundingClientRect().height).toBe(144);
		expect(tree.querySelectorAll('[role="treeitem"]').length).toBeLessThan(20);
	});
});
