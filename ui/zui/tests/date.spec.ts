import { CalendarDate, Time } from '@internationalized/date';
import { describe, expect, it } from 'vitest';

import {
	calendarMonth,
	clampDate,
	daysInMonth,
	formatDate,
	formatTime,
	isDateInRange,
	isDateUnavailable,
	normalizeRange,
	weekdayLabels
} from '../src/runtime/date.js';

describe('date runtime', () => {
	it('builds a stable six-week month with locale week starts', () => {
		const month = new CalendarDate(2026, 8, 1);
		const cells = calendarMonth(month, 'zh-CN', 'mon');
		expect(cells).toHaveLength(42);
		expect(cells[0]?.date.toString()).toBe('2026-07-27');
		expect(cells.filter(({ outsideMonth }) => !outsideMonth)).toHaveLength(31);
		expect(weekdayLabels(month, 'en-US', 'mon')).toEqual([
			'Mon',
			'Tue',
			'Wed',
			'Thu',
			'Fri',
			'Sat',
			'Sun'
		]);
	});

	it('formats, clamps and compares dates and ranges', () => {
		const start = new CalendarDate(2026, 8, 10);
		const end = new CalendarDate(2026, 8, 20);
		expect(formatDate(start, 'en-US')).toContain('2026');
		expect(formatTime(new Time(13, 5), 'en-US')).toMatch(/1:05/u);
		expect(clampDate(new CalendarDate(2026, 8, 1), start, end)).toBe(start);
		expect(isDateUnavailable(new CalendarDate(2026, 8, 21), start, end)).toBe(true);
		expect(normalizeRange(end, start)).toEqual({ end, start });
		expect(isDateInRange(new CalendarDate(2026, 8, 15), { end, start })).toBe(true);
		expect(daysInMonth(new CalendarDate(2024, 2, 1))).toBe(29);
	});

	it('formats CalendarDate values in the same explicit time zone used to create the instant', () => {
		const value = new CalendarDate(2026, 1, 1);
		const options = { day: '2-digit', month: '2-digit', year: 'numeric' } as const;
		expect(formatDate(value, 'en-CA', options, 'Pacific/Kiritimati')).toBe(
			formatDate(value, 'en-CA', options, 'America/Los_Angeles')
		);
		expect(weekdayLabels(value, 'en-US', 'sun', 'short', 'Asia/Shanghai')).toEqual(
			weekdayLabels(value, 'en-US', 'sun', 'short', 'America/New_York')
		);
	});
});
