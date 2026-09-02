import { tick } from 'svelte';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';

import FormEdgeFixture from './FormEdgeFixture.svelte';
import FormGraphFixture from './FormGraphFixture.svelte';
import FormSubmitEpochFixture from './FormSubmitEpochFixture.svelte';

describe('ZForm and ZFormField production contracts', () => {
	it('keeps ZForm and ZFormField Standard Schema output, FieldPath dependencies, first-error focus and dynamic unmounts real', async () => {
		render(FormGraphFixture);
		const form = document.querySelector<HTMLFormElement>('[data-testid="form-graph"]')!;
		const email = document.querySelector<HTMLInputElement>('[data-testid="graph-email"]')!;
		const password = document.querySelector<HTMLInputElement>('[data-testid="graph-password"]')!;
		const confirm = document.querySelector<HTMLInputElement>('[data-testid="graph-confirm"]')!;
		expect(email.name).toBe('users[0].email');
		password.value = 'secret';
		password.dispatchEvent(new InputEvent('input', { bubbles: true }));
		await expect.poll(() => confirm.getAttribute('aria-invalid')).toBe('true');
		confirm.value = 'secret';
		confirm.dispatchEvent(new InputEvent('input', { bubbles: true }));
		email.value = ' Alice@Example.COM ';
		email.dispatchEvent(new InputEvent('input', { bubbles: true }));
		await tick();
		form.requestSubmit();
		await expect
			.poll(() => document.querySelector('[data-testid="graph-output"]')?.textContent)
			.toContain('alice@example.com');
		document.querySelector<HTMLButtonElement>('[data-testid="graph-server-error"]')!.click();
		await tick();
		expect(document.activeElement).toBe(email);
		document.querySelector<HTMLButtonElement>('[data-testid="graph-toggle"]')!.click();
		await tick();
		expect(document.querySelector('[data-testid="graph-confirm"]')).toBeNull();
	});

	it('keeps ZForm submit busy state and validation generation race fail-closed', async () => {
		render(FormSubmitEpochFixture);
		const form = document.querySelector<HTMLFormElement>('[data-testid="submit-epoch-form"]')!;
		const input = document.querySelector<HTMLInputElement>('[data-testid="submit-epoch-input"]')!;
		const output = document.querySelector<HTMLOutputElement>(
			'[data-testid="submit-epoch-output"]'
		)!;
		input.value = 'ready';
		input.dispatchEvent(new InputEvent('input', { bubbles: true }));
		await tick();
		form.requestSubmit();
		await expect.poll(() => output.textContent).toContain('2:true:true:0:0');
		document.querySelector<HTMLButtonElement>('[data-testid="resolve-submit"]')!.click();
		await expect.poll(() => output.textContent).toContain('2:true:true:0:1');
		document.querySelector<HTMLButtonElement>('[data-testid="resolve-old"]')!.click();
		await expect.poll(() => output.textContent).toBe('2:true:false:0:1');
	});

	it('keeps ZForm and ZFormField native busy, schema failure, reset and prevented-submit boundaries real', async () => {
		render(FormEdgeFixture);
		const prevented = document.querySelector<HTMLFormElement>('[data-testid="prevented-form"]')!;
		expect(prevented.getAttribute('aria-busy')).toBe('true');
		const throwing = document.querySelector<HTMLFormElement>('[data-testid="throwing-form"]')!;
		const input = document.querySelector<HTMLInputElement>('[data-testid="edge-input"]')!;
		input.value = 'changed';
		input.dispatchEvent(new InputEvent('input', { bubbles: true }));
		await new Promise((resolve) => setTimeout(resolve, 20));
		throwing.requestSubmit();
		await tick();
		await Promise.resolve();
		expect(document.querySelector('[data-testid="form-edge-output"]')?.textContent).toContain(
			':2:1:0:0'
		);
		throwing.reset();
		await tick();
		expect(document.querySelector('[data-testid="form-edge-output"]')?.textContent).toContain(
			':2:1:1:0'
		);
		prevented.requestSubmit();
		await tick();
		expect(prevented.getAttribute('aria-busy')).toBe('true');
	});
});
