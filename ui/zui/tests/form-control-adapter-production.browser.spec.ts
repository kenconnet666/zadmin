import { tick } from 'svelte';
import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';

import { mount, unmount } from './browser-lifecycle.js';
import FormControlAdapterFixture from './FormControlAdapterFixture.svelte';
import { resetForm } from './form-reset.js';

function host(): HTMLDivElement {
	const node = document.createElement('div');
	document.body.append(node);
	return node;
}

async function inputText(
	control: HTMLInputElement | HTMLTextAreaElement,
	value: string
): Promise<void> {
	control.value = value;
	control.dispatchEvent(new InputEvent('input', { bubbles: true }));
	await tick();
}

describe('ZForm real control adapters', () => {
	it('projects model values through six control families, schema and native FormData', async () => {
		const target = host();
		const component = mount(FormControlAdapterFixture, { target });
		const form = target.querySelector<HTMLFormElement>('[data-testid="adapter-form"]')!;
		const externalForm = target.querySelector<HTMLFormElement>(
			'[data-testid="adapter-external-form"]'
		)!;
		const input = target.querySelector<HTMLInputElement>('[data-testid="adapter-input"]')!;
		const textarea = target.querySelector<HTMLTextAreaElement>('[data-testid="adapter-textarea"]')!;
		const checkbox = target.querySelector<HTMLInputElement>('[data-testid="adapter-checkbox"]')!;
		const select = target.querySelector<HTMLSelectElement>('[data-testid="adapter-select"]')!;
		const group = target.querySelector<HTMLElement>('[data-testid="adapter-group"]')!;
		const write = group.querySelector<HTMLInputElement>('input[value="write"]')!;
		const password = target.querySelector<HTMLInputElement>('[data-testid="adapter-password"]')!;
		const external = target.querySelector<HTMLInputElement>('[data-testid="adapter-external"]')!;
		const values = target.querySelector<HTMLOutputElement>('[data-testid="adapter-values"]')!;
		const counts = target.querySelector<HTMLOutputElement>('[data-testid="adapter-counts"]')!;

		expect(values.textContent).toBe('Ada|Initial notes|true|editor|read|secret|outside');
		expect(counts.textContent).toBe('0:0');
		expect([input.value, textarea.value, checkbox.checked, select.value, password.value]).toEqual([
			'Ada',
			'Initial notes',
			true,
			'editor',
			'secret'
		]);
		expect(write.checked).toBe(false);

		await inputText(input, 'Bea');
		await inputText(textarea, 'Revised notes');
		await userEvent.click(checkbox);
		select.value = 'admin';
		select.dispatchEvent(new InputEvent('input', { bubbles: true }));
		select.dispatchEvent(new Event('change', { bubbles: true }));
		await tick();
		await userEvent.click(write);
		await inputText(password, 'changed-secret');
		await inputText(external, 'remote');

		expect(values.textContent).toBe(
			'Bea|Revised notes|false|admin|read,write|changed-secret|remote'
		);
		expect(counts.textContent).toBe('7:7');
		const data = new FormData(form);
		expect(data.get('name')).toBe('Bea');
		expect(data.get('notes')).toBe('Revised notes');
		expect(data.get('active')).toBeNull();
		expect(data.get('role')).toBe('admin');
		expect(data.getAll('permissions')).toEqual(['read', 'write']);
		expect(data.get('password')).toBe('changed-secret');
		expect(data.get('external')).toBeNull();
		expect(new FormData(externalForm).get('external')).toBe('remote');

		form.requestSubmit();
		await expect
			.poll(() => target.querySelector('[data-testid="adapter-submitted"]')?.textContent)
			.toBe('Bea:Bea');
		await unmount(component);
		target.remove();
	});

	it('separates external/controller sync from user callbacks and maps model undefined to empty controls', async () => {
		const target = host();
		const component = mount(FormControlAdapterFixture, { target });
		const input = target.querySelector<HTMLInputElement>('[data-testid="adapter-input"]')!;
		const textarea = target.querySelector<HTMLTextAreaElement>('[data-testid="adapter-textarea"]')!;
		const checkbox = target.querySelector<HTMLInputElement>('[data-testid="adapter-checkbox"]')!;
		const select = target.querySelector<HTMLSelectElement>('[data-testid="adapter-select"]')!;
		const group = target.querySelector<HTMLElement>('[data-testid="adapter-group"]')!;
		const counts = target.querySelector<HTMLOutputElement>('[data-testid="adapter-counts"]')!;

		component.mutateExternalName();
		await expect.poll(() => input.value).toBe('Grace');
		expect(counts.textContent).toBe('0:0');
		component.setNameThroughController();
		await expect.poll(() => input.value).toBe('Lin');
		expect(counts.textContent).toBe('1:0');

		component.clearThroughController();
		await tick();
		expect(input.value).toBe('');
		expect(textarea.value).toBe('');
		expect(checkbox.checked).toBe(false);
		expect(select.value).toBe('');
		expect(group.querySelectorAll<HTMLInputElement>('input:checked')).toHaveLength(0);
		expect(counts.textContent).toBe('6:0');
		await unmount(component);
		target.remove();
	});

	it('repairs native DOM after baseline and rejected controlled resets', async () => {
		const target = host();
		const component = mount(FormControlAdapterFixture, { target });
		await tick();
		const form = target.querySelector<HTMLFormElement>('[data-testid="adapter-form"]')!;
		const input = target.querySelector<HTMLInputElement>('[data-testid="adapter-input"]')!;
		const textarea = target.querySelector<HTMLTextAreaElement>('[data-testid="adapter-textarea"]')!;
		const checkbox = target.querySelector<HTMLInputElement>('[data-testid="adapter-checkbox"]')!;
		const select = target.querySelector<HTMLSelectElement>('[data-testid="adapter-select"]')!;
		const rejectedForm = target.querySelector<HTMLFormElement>(
			'[data-testid="adapter-rejected-form"]'
		)!;
		const rejected = target.querySelector<HTMLInputElement>('[data-testid="adapter-rejected"]')!;

		await resetForm(form);
		await expect.poll(() => input.value).toBe('Ada');
		expect(textarea.value).toBe('Initial notes');
		expect(checkbox.checked).toBe(true);
		expect(select.value).toBe('editor');
		await resetForm(form);
		await expect.poll(() => input.value).toBe('Ada');
		expect(textarea.value).toBe('Initial notes');
		expect(checkbox.checked).toBe(true);
		expect(select.value).toBe('editor');

		await inputText(rejected, 'attempted');
		expect(rejected.value).toBe('fixed');
		await resetForm(rejectedForm);
		await expect.poll(() => rejected.value).toBe('fixed');
		await resetForm(rejectedForm);
		await expect.poll(() => rejected.value).toBe('fixed');
		await unmount(component);
		target.remove();
	});
});
