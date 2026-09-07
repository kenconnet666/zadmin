import { tick } from 'svelte';
import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';

import PersianDateTimeFieldFixture from './PersianDateTimeFieldFixture.svelte';

describe('Persian DateTimeField locale numerals', () => {
	it('uses the same locale digits for date and time while preserving hidden milliseconds', async () => {
		render(PersianDateTimeFieldFixture);
		await tick();
		const root = document.querySelector<HTMLElement>('[data-testid="persian-date-time-field"]')!;
		const year = root.querySelector<HTMLInputElement>('input[aria-label="Year"]')!;
		const hour = root.querySelector<HTMLInputElement>('input[aria-label="Hour"]')!;
		const minute = root.querySelector<HTMLInputElement>('input[aria-label="Minute"]')!;
		const second = root.querySelector<HTMLInputElement>('input[aria-label="Second"]')!;
		expect(year.value).toBe('۱۴۰۳');
		expect(hour.value).toBe('۱۳');
		expect(minute.value).toBe('۰۵');
		expect(second.value).toBe('۰۹');

		await userEvent.clear(minute);
		await userEvent.type(minute, '۰۷');
		await expect
			.poll(() => document.querySelector('[data-testid="persian-date-time-output"]')?.textContent)
			.toContain('persian:1403-1-1:13:7:9:125|1');
		expect(minute.value).toBe('۰۷');
		expect(
			new FormData(
				document.querySelector<HTMLFormElement>('[data-testid="persian-date-time-form"]')!
			).get('meeting')
		).toBe('2024-03-20T13:07:09.125');
	});
});
