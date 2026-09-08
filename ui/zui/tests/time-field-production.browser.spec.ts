import { tick } from 'svelte';
import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';

import TimeFieldProductionFixture from './TimeFieldProductionFixture.svelte';
import { mount, unmount } from './browser-lifecycle.js';

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

	it('keeps 12-hour segments localized while committing canonical 24-hour FormData', async () => {
		await render(TimeFieldProductionFixture);
		const form = document.querySelector<HTMLFormElement>('[data-testid="time-boundary-form"]')!;
		const twelveHour = inputs('time-us-12');
		const period = root('time-us-12').querySelector<HTMLButtonElement>('[data-slot="day-period"]')!;

		expect(twelveHour.map((input) => input.value)).toEqual(['01', '05', '07']);
		expect(new FormData(form).get('twelveHour')).toBe('13:05:07');
		await userEvent.click(twelveHour[0]!);
		await userEvent.keyboard('12');
		await expect.poll(() => new FormData(form).get('twelveHour')).toBe('12:05:07');
		expect(twelveHour[0]).toHaveValue('12');

		await userEvent.click(period);
		await expect.poll(() => new FormData(form).get('twelveHour')).toBe('00:05:07');
		period.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowDown' }));
		await expect.poll(() => new FormData(form).get('twelveHour')).toBe('12:05:07');
		expect(document.querySelector('[data-testid="time-boundary-counters"]')?.textContent).toBe(
			'twelve=3; ime=0'
		);
	});

	it('uses logical RTL segment navigation and rejects constrained drafts without changing canonical FormData', async () => {
		await render(TimeFieldProductionFixture);
		const form = document.querySelector<HTMLFormElement>('[data-testid="time-boundary-form"]')!;
		const rtl = inputs('time-rtl');
		const constrainedRoot = root('time-constrained');
		const constrained = inputs('time-constrained');

		rtl[0]!.focus();
		rtl[0]!.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowLeft' }));
		await tick();
		expect(document.activeElement).toBe(rtl[1]);
		rtl[1]!.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowRight' }));
		await tick();
		expect(document.activeElement).toBe(rtl[0]);
		rtl[0]!.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'End' }));
		await tick();
		expect(document.activeElement).toBe(rtl[1]);

		await userEvent.click(constrained[1]!);
		await userEvent.keyboard('46');
		await tick();
		expect(constrainedRoot).toHaveAttribute('data-invalid', 'true');
		expect(new FormData(form).get('constrained')).toBe('09:30:00');
		await userEvent.keyboard('{Escape}');
		await expect.poll(() => constrained[1]?.value).toBe('30');
		expect(constrainedRoot).not.toHaveAttribute('data-invalid');
		expect(new FormData(form).get('constrained')).toBe('09:30:00');

		await userEvent.click(constrained[0]!);
		await userEvent.keyboard('{Backspace}');
		await userEvent.click(constrained[1]!);
		await userEvent.keyboard('{Backspace}');
		await expect.poll(() => new FormData(form).has('constrained')).toBe(false);
		expect(constrainedRoot).not.toHaveAttribute('data-invalid');
	});

	it('defers composed segments until compositionend instead of committing or moving focus mid-composition', async () => {
		await render(TimeFieldProductionFixture);
		const form = document.querySelector<HTMLFormElement>('[data-testid="time-boundary-form"]')!;
		const composed = inputs('time-ime');
		const hour = composed[0]!;

		hour.focus();
		hour.dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true }));
		hour.value = '10';
		hour.dispatchEvent(
			new InputEvent('input', {
				bubbles: true,
				data: '10',
				inputType: 'insertCompositionText',
				isComposing: true
			})
		);
		const increment = new KeyboardEvent('keydown', {
			bubbles: true,
			cancelable: true,
			key: 'ArrowUp'
		});
		const navigate = new KeyboardEvent('keydown', {
			bubbles: true,
			cancelable: true,
			key: 'ArrowRight'
		});
		hour.dispatchEvent(increment);
		hour.dispatchEvent(navigate);
		await tick();
		expect(hour).toHaveValue('10');
		expect(document.activeElement).toBe(hour);
		expect(increment.defaultPrevented).toBe(false);
		expect(navigate.defaultPrevented).toBe(false);
		expect(new FormData(form).get('ime')).toBe('09:30:00');
		expect(document.querySelector('[data-testid="time-boundary-counters"]')?.textContent).toBe(
			'twelve=0; ime=0'
		);

		hour.dispatchEvent(new CompositionEvent('compositionend', { bubbles: true, data: '10' }));
		await expect.poll(() => new FormData(form).get('ime')).toBe('10:30:00');
		expect(document.activeElement).toBe(composed[1]);
		expect(document.querySelector('[data-testid="time-boundary-counters"]')?.textContent).toBe(
			'twelve=0; ime=1'
		);
		hour.dispatchEvent(
			new InputEvent('input', { bubbles: true, data: '10', inputType: 'insertText' })
		);
		await tick();
		expect(document.querySelector('[data-testid="time-boundary-counters"]')?.textContent).toBe(
			'twelve=0; ime=1'
		);
		hour.focus();
		hour.dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true }));
		hour.value = '11';
		hour.dispatchEvent(
			new InputEvent('input', {
				bubbles: true,
				data: '11',
				inputType: 'insertCompositionText',
				isComposing: true
			})
		);
		const external = document.querySelector<HTMLButtonElement>(
			'[data-testid="time-ime-external"]'
		)!;
		external.focus();
		hour.dispatchEvent(new CompositionEvent('compositionend', { bubbles: true, data: '11' }));
		await expect.poll(() => new FormData(form).get('ime')).toBe('11:30:00');
		expect(document.activeElement).toBe(external);
		expect(document.querySelector('[data-testid="time-boundary-counters"]')?.textContent).toBe(
			'twelve=0; ime=2'
		);

		const hourOnly = inputs('time-ime-hour')[0]!;
		hourOnly.focus();
		hourOnly.dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true }));
		hourOnly.value = '';
		hourOnly.dispatchEvent(
			new InputEvent('input', {
				bubbles: true,
				data: '',
				inputType: 'deleteCompositionText',
				isComposing: true
			})
		);
		await tick();
		expect(new FormData(form).get('imeHour')).toBe('09:00:00');
		expect(document.querySelector('[data-testid="time-ime-hour-counters"]')?.textContent).toBe(
			'changes=0'
		);
		hourOnly.dispatchEvent(new CompositionEvent('compositionend', { bubbles: true, data: '' }));
		await expect.poll(() => new FormData(form).get('imeHour')).toBeNull();
		expect(document.querySelector('[data-testid="time-ime-hour-counters"]')?.textContent).toBe(
			'changes=1'
		);
	});

	it('advances a composed segment within its ShadowRoot focus realm', async () => {
		const host = document.createElement('div');
		document.body.append(host);
		const shadow = host.attachShadow({ mode: 'open' });
		const component = mount(TimeFieldProductionFixture, { target: shadow });
		try {
			await tick();
			const field = shadow.querySelector<HTMLElement>('[data-testid="time-ime"]')!;
			const composed = [...field.querySelectorAll<HTMLInputElement>('input')];
			const hour = composed[0]!;
			hour.focus();
			expect(shadow.activeElement).toBe(hour);
			hour.dispatchEvent(new CompositionEvent('compositionstart', { bubbles: true }));
			hour.value = '10';
			hour.dispatchEvent(
				new InputEvent('input', {
					bubbles: true,
					data: '10',
					inputType: 'insertCompositionText',
					isComposing: true
				})
			);
			hour.dispatchEvent(new CompositionEvent('compositionend', { bubbles: true, data: '10' }));
			await expect.poll(() => shadow.activeElement).toBe(composed[1]);
		} finally {
			await unmount(component);
			host.remove();
		}
	});
});
