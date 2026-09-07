import { CalendarDate, GregorianCalendar } from '@internationalized/date';
import { describe, expect, it } from 'vitest';

import {
	calendarMonthCells,
	calendarRangeIsContiguous,
	normalizeCalendarMultipleModelValue,
	toggleCalendarMultipleValue,
	validateVisibleMonths,
	visibleCalendarMonths
} from '../src/runtime/calendar.js';

describe('calendar selection and visible-month runtime', () => {
	it('validates one through twelve shared visible months', () => {
		expect(visibleCalendarMonths(new CalendarDate(2026, 11, 15), 3).map(String)).toEqual([
			'2026-11-01',
			'2026-12-01',
			'2027-01-01'
		]);
		expect(() => validateVisibleMonths(0)).toThrow(/1 through 12/u);
		expect(() => validateVisibleMonths(13)).toThrow(/1 through 12/u);
		expect(() => validateVisibleMonths(1.5)).toThrow(/integer/u);
		const bc = new CalendarDate(new GregorianCalendar(), 'BC', 2, 12, 15);
		expect(visibleCalendarMonths(bc, 2)[0]?.era).toBe('BC');
	});

	it('shortens the window and removes repeated interactive dates at the maximum month', () => {
		const maximum = new CalendarDate(9999, 12, 31);
		const months = visibleCalendarMonths(maximum, 12);
		expect(months.map(String)).toEqual(['9999-12-01']);
		const cells = calendarMonthCells(months[0]!, months, 'en-US', 'sun');
		const interactive = cells
			.filter((cell) => !cell.duplicateOutside)
			.map((cell) => cell.date.toString());
		expect(new Set(interactive).size).toBe(interactive.length);
		expect(cells.filter((cell) => cell.date.toString() === '9999-12-31').length).toBeGreaterThan(1);
		expect(
			cells.filter((cell) => cell.date.toString() === '9999-12-31' && !cell.duplicateOutside)
		).toHaveLength(1);
	});

	it('deduplicates multiple values while preserving caller and append order', () => {
		const fifth = new CalendarDate(2026, 9, 5);
		const tenth = new CalendarDate(2026, 9, 10);
		const normalized = normalizeCalendarMultipleModelValue([tenth, fifth, tenth]);
		expect(normalized.map(String)).toEqual(['2026-09-10', '2026-09-05']);
		expect(
			toggleCalendarMultipleValue(normalized, new CalendarDate(2026, 9, 7)).map(String)
		).toEqual(['2026-09-10', '2026-09-05', '2026-09-07']);
		expect(toggleCalendarMultipleValue(normalized, tenth).map(String)).toEqual(['2026-09-05']);
	});

	it('marks outside dates already owned by another visible month as non-interactive duplicates', () => {
		const months = visibleCalendarMonths(new CalendarDate(2026, 9, 1), 2);
		const september = calendarMonthCells(months[0]!, months, 'en-US', 'sun');
		expect(
			september.some(
				(cell) => cell.date.year === 2026 && cell.date.month === 10 && cell.duplicateOutside
			)
		).toBe(true);
	});

	it('rejects a contiguous range when any interior date is unavailable', () => {
		const range = {
			start: new CalendarDate(2026, 9, 14),
			end: new CalendarDate(2026, 9, 16)
		};
		expect(calendarRangeIsContiguous(range, (date) => date.day === 15)).toBe(false);
		expect(calendarRangeIsContiguous(range, () => false)).toBe(true);
	});

	it('supports ranges beyond 10,000 days and terminates at the maximum CalendarDate', () => {
		expect(
			calendarRangeIsContiguous(
				{ start: new CalendarDate(1990, 1, 1), end: new CalendarDate(2030, 1, 1) },
				() => false
			)
		).toBe(true);
		expect(
			calendarRangeIsContiguous(
				{ start: new CalendarDate(9999, 12, 30), end: new CalendarDate(9999, 12, 31) },
				() => false
			)
		).toBe(true);
	});
});
