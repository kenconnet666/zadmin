import { CalendarDate, JapaneseCalendar, Time, createCalendar } from '@internationalized/date';
import { describe, expect, it } from 'vitest';

import {
	calendarMonth,
	calendarEraOptions,
	clampDate,
	dateFieldPattern,
	daysInMonth,
	formatDate,
	formatTime,
	isCalendarDate,
	isDateInRange,
	isDateUnavailable,
	normalizeCalendarDateModelValue,
	normalizeCalendarRangeModelValue,
	normalizeRange,
	normalizeRangeValue,
	normalizeTimeModelValue,
	monthsInYear,
	preserveCalendarOwner,
	resolveDisplayCalendar,
	resolveHourCycle,
	resolveOwnerCalendar,
	timeFieldPattern,
	toDisplayCalendar,
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

	it('derives date, era and time segment order from locale without changing the value model', () => {
		expect(
			dateFieldPattern('en-US').flatMap((part) => ('segment' in part ? [part.segment] : []))
		).toEqual(['month', 'day', 'year']);
		expect(
			dateFieldPattern('zh-CN').flatMap((part) => ('segment' in part ? [part.segment] : []))
		).toEqual(['year', 'month', 'day']);
		const japanese = new CalendarDate(createCalendar('japanese'), 'reiwa', 8, 9, 7);
		expect(
			dateFieldPattern('ja-JP-u-ca-japanese', 'UTC', japanese).flatMap((part) =>
				'segment' in part ? [part.segment] : []
			)
		).toContain('era');
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

	it('normalizes first-party CalendarDate models without erasing their calendar or era', () => {
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
		const japanese = new CalendarDate(new JapaneseCalendar(), 'reiwa', 8, 9, 7);
		expect(normalizeCalendarDateModelValue(japanese, 'Date owner')).toBe(japanese);
		expect(isCalendarDate(japanese)).toBe(true);
		expect(() => normalizeTimeModelValue(new Date(), 'Time owner')).toThrow(
			/Time, null or undefined/u
		);
	});

	it('resolves only implemented display calendars and makes the ISO alias explicit', () => {
		expect(resolveDisplayCalendar('en-US-u-ca-hebrew').identifier).toBe('hebrew');
		expect(resolveDisplayCalendar('en-US-u-ca-iso8601').identifier).toBe('gregory');
		expect(() => resolveDisplayCalendar('en-US-u-ca-foobar')).toThrow(
			/requested display calendar "foobar" is not supported/u
		);
		for (const identifier of ['chinese', 'dangi', 'islamic', 'islamic-rgsa'] as const)
			expect(() => resolveDisplayCalendar(`en-US-u-ca-${identifier}`)).toThrow(
				new RegExp(`display calendar "${identifier}" is not supported`, 'u')
			);
	});

	it('converts through a locale display calendar and restores the original owner calendar', () => {
		const owner = new CalendarDate(2026, 9, 7);
		const displayCalendar = resolveDisplayCalendar('he-IL-u-ca-hebrew');
		const displayed = toDisplayCalendar(owner, displayCalendar);
		expect(displayed.calendar.identifier).toBe('hebrew');
		const restored = preserveCalendarOwner(displayed, owner);
		expect(restored.calendar.identifier).toBe('gregory');
		expect(restored.toString()).toBe(owner.toString());
		expect(resolveOwnerCalendar(displayed, owner).identifier).toBe('hebrew');
	});

	it('uses calendar-owned leap months, era boundaries and year transitions for day arithmetic', () => {
		const hebrew = new CalendarDate(createCalendar('hebrew'), 5784, 1, 1);
		expect(monthsInYear(hebrew)).toBe(13);
		const hebrewCells = calendarMonth(hebrew, 'he-IL-u-ca-hebrew', 'sun');
		expect(hebrewCells.every(({ date }) => date.calendar.identifier === 'hebrew')).toBe(true);
		expect(hebrewCells.filter(({ outsideMonth }) => !outsideMonth)).toHaveLength(
			daysInMonth(hebrew)
		);

		const reiwaStart = new CalendarDate(createCalendar('japanese'), 'reiwa', 1, 5, 1);
		const previous = reiwaStart.subtract({ days: 1 });
		expect([previous.era, previous.year, previous.month, previous.day]).toEqual([
			'heisei',
			31,
			4,
			30
		]);
		const eras = calendarEraOptions(reiwaStart, 'ja-JP-u-ca-japanese', 'Asia/Tokyo');
		expect(eras.some(({ identifier, label }) => identifier === 'reiwa' && label.length > 0)).toBe(
			true
		);
		expect(eras.find(({ identifier }) => identifier === 'meiji')?.label).toBe('明治');
		const meijiJuly = new CalendarDate(createCalendar('japanese'), 'meiji', 45, 7, 1);
		const japaneseMonth = calendarMonth(meijiJuly, 'ja-JP-u-ca-japanese', 'sun');
		expect(
			japaneseMonth.find(
				({ date }) =>
					date.era === 'taisho' && date.year === 1 && date.month === 7 && date.day === 30
			)?.outsideMonth
		).toBe(false);

		const persianEnd = new CalendarDate(createCalendar('persian'), 1402, 12, 29);
		const persianNext = persianEnd.add({ days: 1 });
		expect([persianNext.year, persianNext.month, persianNext.day]).toEqual([1403, 1, 1]);
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
