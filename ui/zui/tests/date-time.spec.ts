import {
	CalendarDate,
	CalendarDateTime,
	Time,
	createCalendar,
	parseZonedDateTime,
	toTimeZone
} from '@internationalized/date';
import { describe, expect, it } from 'vitest';

import {
	composeDateTime,
	dateTimeParts,
	displayDateTime,
	formatDateTime,
	isDateTimeUnavailable,
	normalizeDateTimeModelValue
} from '../src/runtime/date-time.js';

describe('date-time runtime', () => {
	it('formats local wall-clock values without DST normalization and zoned values in the display zone', () => {
		const options = { hourCycle: 'h23' } as const;
		expect(
			formatDateTime(new CalendarDateTime(2026, 3, 8, 2, 30), 'en-GB', options, 'America/New_York')
		).toContain('2:30');
		expect(
			formatDateTime(
				parseZonedDateTime('2026-11-01T01:30-04:00[America/New_York]'),
				'en-GB',
				options,
				'Asia/Shanghai'
			)
		).toContain('13:30');
	});
	it('keeps local values as CalendarDateTime and rejects only type or mode drift', () => {
		const value = composeDateTime({
			date: new CalendarDate(2026, 9, 7),
			displayTimeZone: 'UTC',
			mode: 'local',
			time: new Time(9, 30, 15)
		});
		expect(value).toEqual(new CalendarDateTime(2026, 9, 7, 9, 30, 15));
		expect(() =>
			normalizeDateTimeModelValue(new CalendarDate(2026, 9, 7), 'local', 'Test')
		).toThrow(/CalendarDateTime/u);
		expect(() => normalizeDateTimeModelValue(value, 'zoned', 'Test')).toThrow(/ZonedDateTime/u);
	});

	it('preserves the date calendar and era through local and zoned composition', () => {
		const date = new CalendarDate(createCalendar('hebrew'), 5787, 1, 1);
		const local = composeDateTime({
			date,
			displayTimeZone: 'Asia/Jerusalem',
			mode: 'local',
			time: new Time(9, 30, 15, 125)
		});
		expect(local.calendar.identifier).toBe('hebrew');
		expect(local.era).toBe(date.era);
		expect(normalizeDateTimeModelValue(local, 'local', 'Test')).toBe(local);

		const zoned = composeDateTime({
			date,
			displayTimeZone: 'Asia/Jerusalem',
			mode: 'zoned',
			ownerTimeZone: 'America/New_York',
			time: new Time(9, 30)
		});
		expect(zoned.calendar.identifier).toBe('hebrew');
		expect(zoned.timeZone).toBe('America/New_York');
		expect(dateTimeParts(zoned).date.calendar.identifier).toBe('hebrew');
		expect(normalizeDateTimeModelValue(zoned, 'zoned', 'Test')).toBe(zoned);
	});

	it('preserves an existing instant in a display zone and restores its owner zone after editing', () => {
		const owner = parseZonedDateTime('2026-09-07T09:30-07:00[America/Los_Angeles]');
		const display = displayDateTime(owner, 'zoned', 'America/New_York');
		expect(display.toDate().getTime()).toBe(owner.toDate().getTime());
		const parts = dateTimeParts(display);
		const edited = composeDateTime({
			date: parts.date,
			displayTimeZone: 'America/New_York',
			mode: 'zoned',
			ownerTimeZone: owner.timeZone,
			time: parts.time.add({ minutes: 1 })
		});
		expect(edited.timeZone).toBe('America/Los_Angeles');
		expect(toTimeZone(edited, 'America/New_York').minute).toBe(display.minute + 1);
	});

	it('applies DST disambiguation and date-time-wide availability to the combined value', () => {
		const options = {
			date: new CalendarDate(2026, 3, 8),
			displayTimeZone: 'America/New_York',
			mode: 'zoned' as const,
			time: new Time(2, 30)
		};
		expect(() => composeDateTime({ ...options, disambiguation: 'reject' })).toThrow(RangeError);
		const earlier = composeDateTime({ ...options, disambiguation: 'earlier' });
		const later = composeDateTime({ ...options, disambiguation: 'later' });
		const compatible = composeDateTime({ ...options, disambiguation: 'compatible' });
		expect(later.toDate().getTime() - earlier.toDate().getTime()).toBe(3_600_000);
		expect(compatible.toDate().getTime()).toBe(later.toDate().getTime());
		expect(isDateTimeUnavailable(later, earlier, undefined, (value) => value.minute === 30)).toBe(
			true
		);
	});
});
