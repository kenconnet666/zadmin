import { tick } from 'svelte';
import { expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';
import FieldsetFixture from './FieldsetFixture.svelte';
import { settleFormReset } from './form-reset.js';

function element<T extends HTMLElement>(id: string): T {
	return document.querySelector<T>(`[data-testid="fieldset-${id}"]`)!;
}

it('preserves native legend exceptions, successful controls and a single disabled visual owner', async () => {
	// @zui-visual ZFieldset disabled family opacity and legend exception
	await render(FieldsetFixture);
	await tick();
	const form = element<HTMLFormElement>('form');
	const group = element<HTMLFieldSetElement>('main');
	const input = element<HTMLInputElement>('input');
	const toggle = element<HTMLButtonElement>('enable');
	expect(group.tagName).toBe('FIELDSET');
	expect(group.firstElementChild?.tagName).toBe('LEGEND');
	expect(toggle.matches(':disabled')).toBe(false);
	expect(group.getAttribute('aria-describedby')?.split(' ')).toHaveLength(2);
	expect(group.dataset.size).toBe('large');
	expect(input.dataset.size).toBe('small');
	expect(new FormData(form).has('username')).toBe(false);
	for (const id of ['input', 'select', 'textarea', 'checkbox', 'action']) {
		const control = element(id);
		expect(control.matches(':disabled')).toBe(true);
		expect(getComputedStyle(control).opacity).toBe('0.5');
	}
	const password = element<HTMLInputElement>('password');
	const passwordToggle = password.parentElement!.querySelector<HTMLButtonElement>('button')!;
	expect(getComputedStyle(element('input-group')).opacity).toBe('0.5');
	expect(getComputedStyle(password).opacity).toBe('1');
	expect(getComputedStyle(passwordToggle).opacity).toBe('1');
	const switchInput = element<HTMLInputElement>('switch');
	expect(getComputedStyle(switchInput).opacity).toBe('0');
	expect(getComputedStyle(switchInput.parentElement!).opacity).toBe('0.5');
	await userEvent.click(toggle);
	await tick();
	expect(input.matches(':disabled')).toBe(false);
	expect(getComputedStyle(input).opacity).toBe('1');
	expect(getComputedStyle(element('input-group')).opacity).toBe('1');
	expect(new FormData(form).get('username')).toBe('Ada');
	expect(new FormData(form).getAll('secret')).toEqual(['hidden']);
	expect(element('locked').matches(':disabled')).toBe(true);
	await userEvent.fill(input, 'Grace');
	form.reset();
	await settleFormReset();
	expect(input.value).toBe('Ada');
});

it('wraps a long legend within narrow layouts without imposing its size on child controls', async () => {
	// @zui-visual ZFieldset narrow legend and independent control sizing
	const viewport = { width: innerWidth, height: innerHeight };
	try {
		await page.viewport(390, 844);
		await render(FieldsetFixture);
		await tick();
		const group = element<HTMLFieldSetElement>('long');
		expect(group.scrollWidth).toBeLessThanOrEqual(group.clientWidth + 1);
		expect(group.querySelector('legend')!.getBoundingClientRect().width).toBeLessThanOrEqual(
			group.clientWidth + 1
		);
	} finally {
		await page.viewport(viewport.width, viewport.height);
	}
});
