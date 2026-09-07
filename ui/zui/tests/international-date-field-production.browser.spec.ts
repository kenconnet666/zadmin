import { tick } from 'svelte';
import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-svelte';

import InternationalDateFieldFixture from './InternationalDateFieldFixture.svelte';

function element<T extends HTMLElement>(testId: string): T {
	return document.querySelector<T>(`[data-testid="${testId}"]`)!;
}

describe('ZDateField international calendar contract', () => {
	it('edits a localized Japanese era while preserving the Japanese model owner', async () => {
		// @zui-visual DateField Japanese era select plus Hebrew and Persian numeric segments
		render(InternationalDateFieldFixture);
		await tick();
		const field = element('date-field-japanese');
		expect(field.dataset.calendar).toBe('japanese');
		const era = field.querySelector<HTMLSelectElement>('[aria-label="Japanese era"]')!;
		const year = field.querySelector<HTMLInputElement>('[aria-label="Japanese year"]')!;
		expect(era.value).toBe('reiwa');
		expect(year.value).toBe('8');
		expect([...era.options].some((option) => option.value === 'heisei')).toBe(true);
		await userEvent.selectOptions(era, 'heisei');
		await expect
			.poll(() => element('international-date-output').textContent)
			.toContain('japanese:heisei:8-9-7');
		expect(field.dataset.calendar).toBe('japanese');
	});

	it('keeps a natural era-year draft intact until explicit commit', async () => {
		render(InternationalDateFieldFixture);
		await tick();
		const year = element('date-field-japanese').querySelector<HTMLInputElement>(
			'[aria-label="Japanese year"]'
		)!;
		await userEvent.clear(year);
		await userEvent.type(year, '12');
		expect(year.value).toBe('12');
		expect(element('international-date-output').textContent).toContain('japanese:reiwa:8-9-7');
		await userEvent.keyboard('{Enter}');
		await expect
			.poll(() => element('international-date-output').textContent)
			.toContain('japanese:reiwa:12-9-7');
		expect(year.value).toBe('12');
	});

	it('preserves four-digit Gregorian drafting and automatic completion', async () => {
		render(InternationalDateFieldFixture);
		await tick();
		const year = element('date-field-gregorian').querySelector<HTMLInputElement>(
			'[aria-label="Gregorian year"]'
		)!;
		expect(year.value).toBe('0008');
		await userEvent.clear(year);
		await userEvent.type(year, '0012');
		await expect
			.poll(() => element('international-date-output').textContent)
			.toContain('gregory:AD:12-9-7');
		expect(year.value).toBe('0012');
	});

	it('cycles a Hebrew leap-month field with calendar-owned month arithmetic', async () => {
		render(InternationalDateFieldFixture);
		await tick();
		const field = element('date-field-hebrew');
		const month = field.querySelector<HTMLInputElement>('[aria-label="Hebrew month"]')!;
		expect(field.dataset.calendar).toBe('hebrew');
		expect(month.value).toBe('06');
		month.focus();
		await userEvent.keyboard('{ArrowUp}');
		await expect
			.poll(() => element('international-date-output').textContent)
			.toContain('hebrew:AM:5784-7-15');
		expect(month.value).toBe('07');
	});

	it('remembers a Persian owner calendar after a controlled clear and reselect', async () => {
		const component = render(InternationalDateFieldFixture);
		await tick();
		const field = element('date-field-persian');
		component.clearPersian();
		await tick();
		expect(field.querySelector<HTMLInputElement>('[aria-label="Persian day"]')?.value).toBe('');
		const day = field.querySelector<HTMLInputElement>('[aria-label="Persian day"]')!;
		day.focus();
		await userEvent.keyboard('{ArrowUp}');
		await expect
			.poll(() => element('international-date-output').textContent)
			.toContain('persian:AP:');
		expect(field.dataset.calendar).toBe('persian');
		expect(
			new FormData(element<HTMLFormElement>('international-date-form')).get('persian')
		).toMatch(/^\d{4}-\d{2}-\d{2}$/u);
	});

	it('formats and parses Persian locale numerals through the shared number runtime', async () => {
		render(InternationalDateFieldFixture);
		await tick();
		const year = element('date-field-persian').querySelector<HTMLInputElement>(
			'[aria-label="Persian year"]'
		)!;
		expect(year.value).toBe('۱۴۰۳');
		await userEvent.clear(year);
		await userEvent.type(year, '۱۴۰۴');
		expect(year.value).toBe('۱۴۰۴');
		await userEvent.keyboard('{Enter}');
		await expect
			.poll(() => element('international-date-output').textContent)
			.toContain('persian:AP:1404-1-1');
	});
});
