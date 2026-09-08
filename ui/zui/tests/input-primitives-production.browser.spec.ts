import { tick } from 'svelte';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';

import InputPrimitivesFixture from './InputPrimitivesFixture.svelte';
import { settleFormReset } from './form-reset.js';

let originalViewport: { height: number; width: number };

beforeEach(async () => {
	originalViewport = { height: window.innerHeight, width: window.innerWidth };
	await page.viewport(1024, 768);
});

afterEach(async () => {
	await page.viewport(originalViewport.width, originalViewport.height);
});

function element<T extends HTMLElement>(testId: string): T {
	return document.querySelector<T>(`[data-testid="${testId}"]`)!;
}

describe('ZPasswordInput production contract', () => {
	it('keeps one native value owner, pointer focus/caret, FormData and reset stable while visibility changes', async () => {
		await render(InputPrimitivesFixture);
		await tick();
		const form = element<HTMLFormElement>('password-form');
		const input = element<HTMLInputElement>('password-main');
		const root = input.parentElement!;
		const toggle = root.querySelector<HTMLButtonElement>('[data-slot="toggle"]')!;
		const label = document.querySelector<HTMLLabelElement>(`label[for="${input.id}"]`)!;

		expect(input.type).toBe('password');
		expect(input.getAttribute('autocomplete')).toBe('current-password');
		expect(input.required).toBe(true);
		expect(input.dataset.size).toBe('large');
		expect(input.getAttribute('aria-invalid')).toBe('true');
		expect(input.getAttribute('aria-describedby')?.split(' ').length).toBeGreaterThanOrEqual(2);
		expect(label.textContent).toContain('Account password');
		expect(root.dataset.visible).toBe('false');
		expect(toggle.type).toBe('button');
		expect(toggle.getAttribute('aria-label')).toBe('Show password');
		expect(toggle.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true');
		expect(new FormData(form).get('password')).toBe('secret');

		await userEvent.fill(input, 'new-secret');
		await expect.poll(() => element('password-output').textContent).toBe('new-secret|false|1|0|0');
		input.setSelectionRange(2, 6, 'forward');
		const identity = input;
		await userEvent.click(toggle);
		await expect.poll(() => input.type).toBe('text');
		expect(element('password-main')).toBe(identity);
		expect(document.activeElement).toBe(input);
		await expect.poll(() => [input.selectionStart, input.selectionEnd]).toEqual([2, 6]);
		expect(toggle.getAttribute('aria-label')).toBe('Hide password');
		expect(element('password-output').textContent).toBe('new-secret|true|1|1|0');

		toggle.focus();
		await userEvent.keyboard(' ');
		await expect.poll(() => input.type).toBe('password');
		expect(document.activeElement).toBe(toggle);
		expect(element('password-output').textContent).toBe('new-secret|false|1|2|0');

		await userEvent.click(toggle);
		await expect.poll(() => input.type).toBe('text');
		await userEvent.click(element('password-reset'));
		await settleFormReset(form);
		expect(input.type).toBe('password');
		expect(input.value).toBe('secret');
		expect(new FormData(form).get('password')).toBe('secret');
		expect(element('password-output').textContent).toBe('secret|false|1|3|1');
	});

	it('inherits readonly and disabled Field state, keeps readonly reveal available and exposes five sizes', async () => {
		// @zui-visual ZPasswordInput Field state and five-size geometry
		await render(InputPrimitivesFixture);
		await tick();
		const readonly = element<HTMLInputElement>('password-readonly');
		const readonlyRoot = readonly.parentElement!;
		const readonlyToggle = readonlyRoot.querySelector<HTMLButtonElement>('[data-slot="toggle"]')!;
		expect(readonly.readOnly).toBe(true);
		expect(readonly.disabled).toBe(false);
		expect(readonlyToggle.disabled).toBe(false);
		expect(element('password-custom-toggle').dataset.readonly).toBe('true');
		readonly.focus();
		readonly.setSelectionRange(1, 4);
		await userEvent.click(readonlyToggle);
		await expect.poll(() => readonly.type).toBe('text');
		expect(document.activeElement).toBe(readonly);
		expect(readonly.selectionStart).toBe(1);
		expect(readonly.selectionEnd).toBe(4);
		expect(element('password-custom-toggle').dataset.visible).toBe('true');
		expect(element('password-readonly-output').textContent).toBe('true:1');

		const disabled = element<HTMLInputElement>('password-disabled');
		const disabledToggle =
			disabled.parentElement!.querySelector<HTMLButtonElement>('[data-slot="toggle"]')!;
		expect(disabled.disabled).toBe(true);
		expect(disabledToggle.disabled).toBe(true);
		expect(disabled.parentElement?.dataset.disabled).toBe('true');

		for (const [size, height] of [
			['xsmall', 24],
			['small', 28],
			['medium', 32],
			['large', 40],
			['xlarge', 48]
		] as const) {
			const sized = element<HTMLInputElement>(`password-size-${size}`);
			const button = sized.parentElement!.querySelector<HTMLButtonElement>('[data-slot="toggle"]')!;
			expect(sized.dataset.size).toBe(size);
			expect(sized.getBoundingClientRect().height).toBeCloseTo(height, 0);
			expect(button.dataset.size).toBe(size);
			expect(button.getBoundingClientRect().height).toBeCloseTo(height, 0);
			expect(button.getBoundingClientRect().width).toBeCloseTo(height, 0);
		}
	});

	it('acts as one grouped control with Group size, state, focus chrome and disabled opacity ownership', async () => {
		await render(InputPrimitivesFixture);
		await tick();
		const group = element('password-group-readonly');
		const input = element<HTMLInputElement>('password-group-readonly-input');
		const toggle = input.parentElement!.querySelector<HTMLButtonElement>('[data-slot="toggle"]')!;
		const label = [...document.querySelectorAll<HTMLLabelElement>('label')].find((candidate) =>
			candidate.textContent?.includes('Grouped readonly password')
		)!;

		expect(group.dataset.size).toBe('xsmall');
		expect(input.dataset.size).toBe('xsmall');
		expect(toggle.dataset.size).toBe('xsmall');
		expect(input.readOnly).toBe(true);
		expect(toggle.disabled).toBe(false);
		expect(input.getBoundingClientRect().height).toBeCloseTo(22, 0);
		expect(group.getBoundingClientRect().height).toBeCloseTo(24, 0);
		expect(getComputedStyle(input).borderStyle).toBe('none');
		await userEvent.click(label);
		expect(document.activeElement).toBe(input);
		expect(getComputedStyle(input).outlineStyle).toBe('none');
		expect(getComputedStyle(group).outlineStyle).toBe('solid');
		await userEvent.click(toggle);
		await expect.poll(() => input.type).toBe('text');

		const disabledGroup = element('password-group-disabled');
		const disabledInput = element<HTMLInputElement>('password-group-disabled-input');
		const disabledToggle =
			disabledInput.parentElement!.querySelector<HTMLButtonElement>('[data-slot="toggle"]')!;
		expect(disabledInput.disabled).toBe(true);
		expect(disabledToggle.disabled).toBe(true);
		expect(Number(getComputedStyle(disabledGroup).opacity)).toBeLessThan(1);
		expect(getComputedStyle(disabledInput).opacity).toBe('1');
		expect(getComputedStyle(disabledToggle).opacity).toBe('1');
	});
});

describe('ZNativeSelect production contract', () => {
	it('keeps native options, optgroups, Field semantics, events, FormData and reset synchronized', async () => {
		await render(InputPrimitivesFixture);
		await tick();
		const form = element<HTMLFormElement>('native-select-form');
		const select = element<HTMLSelectElement>('native-select-single');
		const label = document.querySelector<HTMLLabelElement>(`label[for="${select.id}"]`)!;
		expect(select.tagName).toBe('SELECT');
		expect(select.multiple).toBe(false);
		expect(select.required).toBe(true);
		expect(select.value).toBe('svelte');
		expect(select.dataset.size).toBe('large');
		expect(select.getAttribute('aria-invalid')).toBe('true');
		expect(label.textContent).toContain('Framework');
		expect(select.options).toHaveLength(5);
		expect(select.querySelectorAll('optgroup')).toHaveLength(2);
		expect(select.options[0]?.value).toBe('');
		expect(select.options[0]?.disabled).toBe(true);
		expect(
			select.querySelector<HTMLOptGroupElement>('optgroup[label="Unavailable"]')?.disabled
		).toBe(true);
		expect(select.querySelector<HTMLOptionElement>('option[value="react"]')?.disabled).toBe(true);
		expect(new FormData(form).get('framework')).toBe('svelte');

		await userEvent.selectOptions(select, 'vue');
		await expect.poll(() => element('native-select-output').textContent).toBe('vue|1|0|1|1');
		expect(select.value).toBe('vue');
		expect(new FormData(form).get('framework')).toBe('vue');

		await userEvent.click(element('native-select-reset'));
		await settleFormReset(form);
		expect(select.value).toBe('svelte');
		expect(new FormData(form).get('framework')).toBe('svelte');
		expect(element('native-select-output').textContent).toBe('svelte|1|1|1|1');
	});

	it('uses native multiple string arrays, repeated FormData, row size and frozen change snapshots', async () => {
		await render(InputPrimitivesFixture);
		await tick();
		const form = element<HTMLFormElement>('native-select-multiple-form');
		const select = element<HTMLSelectElement>('native-select-multiple');
		expect(select.multiple).toBe(true);
		expect(select.size).toBe(4);
		expect(select.dataset.size).toBe('small');
		expect([...select.selectedOptions].map((option) => option.value)).toEqual(['read', 'write']);
		expect(new FormData(form).getAll('permission')).toEqual(['read', 'write']);

		await userEvent.selectOptions(select, ['write', 'admin']);
		await expect
			.poll(() => element('native-select-multiple-output').textContent)
			.toBe('write,admin|1|0|true');
		expect([...select.selectedOptions].map((option) => option.value)).toEqual(['write', 'admin']);
		expect(new FormData(form).getAll('permission')).toEqual(['write', 'admin']);

		await userEvent.click(element('native-select-multiple-reset'));
		await settleFormReset(form);
		expect([...select.selectedOptions].map((option) => option.value)).toEqual(['read', 'write']);
		expect(new FormData(form).getAll('permission')).toEqual(['read', 'write']);
		expect(element('native-select-multiple-output').textContent).toBe('read,write|1|1|true');
	});

	it('preserves readonly FormData, disabled exclusion and an undefined children-source native default', async () => {
		await render(InputPrimitivesFixture);
		await tick();
		const readonly = element<HTMLSelectElement>('native-select-readonly');
		const readonlyForm = element<HTMLFormElement>('native-select-readonly-form');
		expect(readonly.getAttribute('aria-readonly')).toBe('true');
		expect(readonly.disabled).toBe(false);
		await userEvent.selectOptions(readonly, 'mutable');
		await tick();
		expect(readonly.value).toBe('fixed');
		expect(new FormData(readonlyForm).get('readonly-choice')).toBe('fixed');
		expect(element('native-select-readonly-output').textContent).toBe('fixed:0');

		const disabled = element<HTMLSelectElement>('native-select-disabled');
		expect(disabled.disabled).toBe(true);
		expect(
			new FormData(element<HTMLFormElement>('native-select-disabled-form')).get('disabled-choice')
		).toBeNull();

		const children = element<HTMLSelectElement>('native-select-children');
		expect(children.value).toBe('first');
		expect(element('native-select-children-output').textContent).toBe('undefined');
		expect(
			new FormData(element<HTMLFormElement>('native-select-children-form')).get('children-choice')
		).toBe('first');
		await userEvent.selectOptions(children, 'second');
		await expect.poll(() => element('native-select-children-output').textContent).toBe('second');
	});

	it('shares the five input chrome sizes while keeping visual size separate from native rows', async () => {
		// @zui-visual ZNativeSelect shared input chrome and five-size geometry
		await render(InputPrimitivesFixture);
		await tick();
		for (const [size, height] of [
			['xsmall', 24],
			['small', 28],
			['medium', 32],
			['large', 40],
			['xlarge', 48]
		] as const) {
			const select = element<HTMLSelectElement>(`native-select-size-${size}`);
			expect(select.dataset.size).toBe(size);
			expect(select.size).toBe(0);
			expect(select.getBoundingClientRect().height).toBeCloseTo(height, 0);
			expect(getComputedStyle(select).boxSizing).toBe('border-box');
		}
		const multiple = element<HTMLSelectElement>('native-select-multiple');
		expect(multiple.size).toBe(4);
		expect(multiple.dataset.size).toBe('small');
		const group = element('native-select-group');
		const grouped = element<HTMLSelectElement>('native-select-in-group');
		expect(group.dataset.size).toBe('xsmall');
		expect(grouped.dataset.size).toBe('xsmall');
		expect(group.getBoundingClientRect().height).toBeCloseTo(24, 0);
		expect(getComputedStyle(grouped).borderStyle).toBe('none');
	});
});
