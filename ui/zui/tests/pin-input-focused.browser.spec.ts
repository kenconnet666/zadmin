import { expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';

import PinInputFocusedFixture from './PinInputFocusedFixture.svelte';

function slots(testId: string): HTMLInputElement[] {
	return [
		...document.querySelectorAll<HTMLInputElement>(`[data-testid="${testId}"] [data-slot="input"]`)
	];
}

function dispatchPaste(target: HTMLInputElement, text: string): void {
	const transfer = new DataTransfer();
	transfer.setData('text', text);
	const event = new ClipboardEvent('paste', { bubbles: true, cancelable: true });
	Object.defineProperty(event, 'clipboardData', { configurable: true, value: transfer });
	target.dispatchEvent(event);
}

it('keeps readonly immutable while preserving roving navigation', async () => {
	render(PinInputFocusedFixture);
	const readonlySlots = slots('pin-focused-readonly');
	readonlySlots[1]?.focus();
	for (const key of ['Backspace', 'Delete']) {
		const event = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key });
		readonlySlots[1]?.dispatchEvent(event);
		expect(event.defaultPrevented).toBe(false);
	}
	expect(readonlySlots.map((input) => input.value)).toEqual(['1', '2', '3', '4']);
	readonlySlots[1]?.dispatchEvent(
		new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'ArrowRight' })
	);
	expect(document.activeElement).toBe(readonlySlots[2]);
});

it('clears a slot from a native input event and accepts OTP autofill/paste', async () => {
	render(PinInputFocusedFixture);
	const editableSlots = slots('pin-focused-editable');
	const editable = editableSlots[1]!;
	editable.value = '';
	editable.dispatchEvent(new InputEvent('input', { bubbles: true }));
	await expect.poll(() => editableSlots.map((input) => input.value)).toEqual(['1', '3', '4', '']);

	const autofillSlots = slots('pin-focused-autofill');
	autofillSlots[0]!.value = '9876';
	autofillSlots[0]!.dispatchEvent(new InputEvent('input', { bubbles: true }));
	await expect.poll(() => autofillSlots.map((input) => input.value)).toEqual(['9', '8', '7', '6']);
	dispatchPaste(autofillSlots[1]!, '12a3');
	await expect.poll(() => autofillSlots.map((input) => input.value)).toEqual(['9', '1', '2', '3']);
	expect(autofillSlots[0]).toHaveAttribute('type', 'password');
	expect(autofillSlots[0]).toHaveAttribute('autocomplete', 'one-time-code');
	expect(autofillSlots.slice(1).every((input) => input.autocomplete === 'off')).toBe(true);
});

it('keeps the single bridge value and focus safe when length shrinks', async () => {
	render(PinInputFocusedFixture);
	const dynamic = document.querySelector<HTMLElement>('[data-testid="pin-focused-dynamic"]')!;
	const form = document.querySelector<HTMLFormElement>('[data-testid="pin-focused-form"]')!;
	dynamic.querySelectorAll<HTMLInputElement>('[data-slot="input"]')[5]?.focus();
	document.querySelector<HTMLButtonElement>('[data-testid="pin-focused-shrink"]')!.click();
	await expect.poll(() => slots('pin-focused-dynamic')).toHaveLength(3);
	await expect.poll(() => document.activeElement).toBe(slots('pin-focused-dynamic')[2]);
	expect(new FormData(form).getAll('focused-pin')).toEqual(['123']);
	document.querySelector<HTMLButtonElement>('[data-testid="pin-focused-reset"]')!.click();
	await expect.poll(() => new FormData(form).getAll('focused-pin')).toEqual(['123']);
});
