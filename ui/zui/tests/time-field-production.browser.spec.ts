import { tick } from 'svelte';
import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';

import TimeFieldProductionFixture from './TimeFieldProductionFixture.svelte';

function root(testId: string): HTMLElement {
	return document.querySelector<HTMLElement>(`[data-testid="${testId}"]`)!;
}

function inputs(testId: string): HTMLInputElement[] {
	return [...root(testId).querySelectorAll<HTMLInputElement>('input')];
}

describe('ZTimeField production contract', () => {
	it('rolls a rejected FormModel write back to the canonical Time and keeps FormData stable', async () => {
		await render(TimeFieldProductionFixture);
		const rejected = inputs('time-rejected');
		const form = document.querySelector<HTMLFormElement>('[data-testid="time-rejected-form"]')!;

		expect(rejected.map((input) => input.value)).toEqual(['09', '30', '15']);
		rejected[1]!.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowUp' }));
		await tick();

		expect(rejected.map((input) => input.value)).toEqual(['09', '30', '15']);
		expect(new FormData(form).get('value')).toBe('09:30:15');
		expect(document.querySelector('[data-testid="time-rejected-counters"]')?.textContent).toBe(
			'writes=1; changes=0'
		);
	});

	it('keeps enabled, readonly, disabled and formParticipation none distinct through FormData, ARIA and reset', async () => {
		await render(TimeFieldProductionFixture);
		const form = document.querySelector<HTMLFormElement>('[data-testid="time-ownership-form"]')!;
		const readonly = root('time-readonly');
		const disabled = root('time-disabled');
		const none = root('time-none');

		expect([...new FormData(form).entries()]).toEqual([
			['enabled', '09:30:15'],
			['readonly', '10:00:00']
		]);
		expect(readonly).toHaveAttribute('data-readonly', 'true');
		expect(readonly.querySelector('input')).toHaveAttribute('aria-readonly', 'true');
		expect(disabled).toHaveAttribute('data-disabled', 'true');
		expect(disabled.querySelector('input')).toBeDisabled();
		expect(none.querySelector('input')).not.toBeDisabled();

		const enabledInputs = inputs('time-enabled');
		const readonlyInputs = inputs('time-readonly');
		await userEvent.click(enabledInputs[1]!);
		await userEvent.keyboard('{ArrowUp}');
		await expect.poll(() => new FormData(form).get('enabled')).toBe('09:31:15');
		expect(document.querySelector('[data-testid="time-enabled-counters"]')?.textContent).toBe(
			'changes=1'
		);
		await userEvent.click(readonlyInputs[0]!);
		await userEvent.keyboard('{ArrowUp}');
		expect(new FormData(form).get('readonly')).toBe('10:00:00');
		expect(readonlyInputs[0]).toHaveValue('10');

		form.reset();
		await expect.poll(() => enabledInputs.map((input) => input.value)).toEqual(['09', '30', '15']);
		expect(document.querySelector('[data-testid="time-enabled-counters"]')?.textContent).toBe(
			'changes=1'
		);
		expect([...new FormData(form).entries()]).toEqual([
			['enabled', '09:30:15'],
			['readonly', '10:00:00']
		]);
	});
});
