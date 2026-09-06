import { tick } from 'svelte';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';

import InputApiAuditFixture from './InputApiAuditFixture.svelte';

function element<T extends HTMLElement>(id: string): T {
	return document.querySelector<T>(`[data-testid="${id}"]`)!;
}

function edit(editor: HTMLTextAreaElement, value: string): void {
	editor.value = value;
	editor.setSelectionRange(value.length, value.length);
	editor.dispatchEvent(new InputEvent('input', { bubbles: true }));
}

describe('input API audit regressions', () => {
	it('projects Field sizes through Combobox and Segmented with theme typography', async () => {
		// @zui-visual ZCombobox Field geometry and ZSegmented theme typography
		render(InputApiAuditFixture);
		await tick();
		for (const [size, height, font] of [
			['small', 24, 12],
			['medium', 32, 15],
			['large', 48, 18]
		] as const) {
			const input = element<HTMLInputElement>(`audit-combobox-${size}`);
			const segment = element(`audit-segmented-${size}`).querySelector<HTMLButtonElement>(
				'button'
			)!;
			expect(input.getAttribute('data-size')).toBe(size);
			expect(input.getBoundingClientRect().height).toBe(height);
			expect(segment.getBoundingClientRect().height).toBe(height);
			expect(getComputedStyle(segment).fontSize).toBe(`${font}px`);
			expect(getComputedStyle(segment).fontFamily).toContain('monospace');
			expect(Number.parseFloat(getComputedStyle(segment).lineHeight)).toBeCloseTo(font * 1.25, 1);
		}
		expect(element('audit-combobox-override').getAttribute('data-size')).toBe('small');
	});

	it('closes open Mention suggestions when Field becomes readonly or disabled', async () => {
		render(InputApiAuditFixture);
		await tick();
		const editor = element<HTMLTextAreaElement>('audit-mention');
		for (const state of ['readonly', 'disabled'] as const) {
			const query = state === 'readonly' ? '@a' : '@al';
			edit(editor, query);
			await tick();
			expect(editor.getAttribute('data-state')).toBe('open');
			expect(document.querySelector('[role="option"]')?.textContent).toContain('Alice');
			element<HTMLButtonElement>(`audit-${state}`).click();
			await tick();
			expect(editor.getAttribute('data-state')).toBe('closed');
			expect(state === 'readonly' ? editor.readOnly : editor.disabled).toBe(true);
			editor.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Enter' }));
			await tick();
			expect(editor.value).toBe(query);
			element<HTMLButtonElement>(`audit-${state}`).click();
			await tick();
		}
		expect(element('audit-mention-events').textContent).toBe('2:0');
	});

	it('forwards public form reset callbacks exactly once after clearing draft state', async () => {
		render(InputApiAuditFixture);
		await tick();
		const editor = element<HTMLTextAreaElement>('audit-mention');
		edit(editor, '@a');
		await tick();
		element<HTMLFormElement>('audit-mention-form').reset();
		element<HTMLFormElement>('audit-date-form').reset();
		await tick();
		await Promise.resolve();
		await tick();
		expect(editor.value).toBe('Initial');
		expect(editor.getAttribute('data-state')).toBe('closed');
		expect(element('audit-mention-events').textContent).toBe('1:1');
		expect(element('audit-date-events').textContent).toBe('1:1');
	});

	it('dims composite controls once and applies the theme font to native controls', async () => {
		// @zui-visual ZFileUpload and ZDateRangePicker disabled opacity; ZCalendar theme font
		render(InputApiAuditFixture);
		await tick();
		const upload = element('audit-upload');
		const dropzone = upload.querySelector<HTMLElement>('[data-slot="dropzone"]')!;
		expect(getComputedStyle(upload).opacity).toBe('0.4');
		expect(getComputedStyle(dropzone).opacity).toBe('1');
		expect(getComputedStyle(dropzone).fontFamily).toContain('monospace');
		const remove = upload.querySelector<HTMLButtonElement>('[data-slot="actions"] > button')!;
		expect(remove.disabled).toBe(true);
		expect(getComputedStyle(remove).opacity).toBe('1');
		const range = element('audit-range');
		expect(getComputedStyle(range.querySelector('[data-slot="range-inputs"]')!).opacity).toBe(
			'0.4'
		);
		for (const field of range.querySelectorAll(
			'[data-slot="start-field"], [data-slot="end-field"]'
		)) {
			expect(getComputedStyle(field).opacity).toBe('1');
		}
		const cell = element('audit-calendar').querySelector<HTMLElement>('tbody button')!;
		expect(getComputedStyle(cell).fontFamily).toContain('monospace');
		expect(getComputedStyle(cell).fontSize).toBe('15px');
	});
});
