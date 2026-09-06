import { CalendarDate, JapaneseCalendar, Time } from '@internationalized/date';
import { describe, expect, it } from 'vitest';

import {
	calendarMonth,
	clampDate,
	dateFieldPattern,
	daysInMonth,
	formatDate,
	formatTime,
	isDateInRange,
	isDateUnavailable,
	normalizeCalendarDateModelValue,
	normalizeCalendarRangeModelValue,
	normalizeRange,
	normalizeRangeValue,
	normalizeTimeModelValue,
	resolveHourCycle,
	timeFieldPattern,
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
		expect(normalizeRangeValue({ end: null, start })).toEqual({ end: null, start });
		expect(normalizeRangeValue({ end, start: null })).toEqual({ end, start: null });
		expect(normalizeRangeValue({ end: start, start: end })).toEqual({ end, start });
		expect(daysInMonth(new CalendarDate(2024, 2, 1))).toBe(29);
	});

	it('derives date and time segment order from locale without changing the value model', () => {
		expect(
			dateFieldPattern('en-US').flatMap((part) => ('segment' in part ? [part.segment] : []))
		).toEqual(['month', 'day', 'year']);
		expect(
			dateFieldPattern('zh-CN').flatMap((part) => ('segment' in part ? [part.segment] : []))
		).toEqual(['year', 'month', 'day']);
		expect(resolveHourCycle('en-US')).toBe(12);
		expect(resolveHourCycle('zh-CN')).toBe(24);
		expect(timeFieldPattern('en-US', 12, 'second').some((part) => 'dayPeriod' in part)).toBe(true);
		expect(timeFieldPattern('zh-CN', 24, 'minute').some((part) => 'dayPeriod' in part)).toBe(false);
		expect(
			timeFieldPattern('en-US', 12, 'hour').flatMap((part) =>
				'segment' in part ? [part.segment] : []
			)
		).toEqual(['hour']);
		expect(timeFieldPattern('en-US', 12, 'hour').some((part) => 'dayPeriod' in part)).toBe(true);
	});

	it('normalizes only the first-party date model value shapes', () => {
		const date = new CalendarDate(2026, 9, 7);
		const time = new Time(9, 30, 45, 125);
		expect(normalizeCalendarDateModelValue(date, 'Date owner')).toBe(date);
		expect(normalizeTimeModelValue(time, 'Time owner')).toBe(time);
		expect(
			normalizeCalendarRangeModelValue(
				{ start: new CalendarDate(2026, 9, 9), end: new CalendarDate(2026, 9, 8) },
				'Range owner'
			)
		).toEqual({ start: new CalendarDate(2026, 9, 8), end: new CalendarDate(2026, 9, 9) });
		expect(normalizeCalendarDateModelValue(undefined, 'Date owner')).toBeNull();
		expect(normalizeTimeModelValue(undefined, 'Time owner')).toBeNull();
		expect(normalizeCalendarRangeModelValue(undefined, 'Range owner')).toBeNull();
		expect(() => normalizeCalendarDateModelValue('2026-09-07', 'Date owner')).toThrow(
			/CalendarDate, null or undefined/u
		);
		expect(() =>
			normalizeCalendarDateModelValue(
				new CalendarDate(new JapaneseCalendar(), 'reiwa', 8, 9, 7),
				'Date owner'
			)
		).toThrow(/Gregorian CalendarDate/u);
		expect(() => normalizeTimeModelValue(new Date(), 'Time owner')).toThrow(
			/Time, null or undefined/u
		);
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
