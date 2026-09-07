import {
	CalendarDateTime,
	Time,
	ZonedDateTime,
	createCalendar,
	parseZonedDateTime,
	toCalendar
} from '@internationalized/date';
import { describe, expect, it } from 'vitest';

import {
	composeDateTimePickerCandidate,
	dateTimePickerNow,
	dateTimePickerParts,
	isDateTimePickerValue,
	resolveDateTimePickerPreset,
	sameDateTimePickerValue,
	validateDateTimePickerConstraints,
	type DateTimePickerConstraints
} from '../src/runtime/date-time-picker.js';
import { sameDateTimeRangeValue } from '../src/runtime/date-time-range.js';

function constraints(
	overrides: Partial<DateTimePickerConstraints> = {}
): DateTimePickerConstraints {
	return {
		disambiguation: 'compatible',
		granularity: 'minute',
		hourCycle: 24,
		minuteStep: 1,
		mode: 'local',
		secondStep: 1,
		timeZone: 'Asia/Jerusalem',
		...overrides
	};
}

describe('date-time picker international calendar runtime', () => {
	it('accepts and composes a local CalendarDateTime without replacing its calendar or era', () => {
		const hebrew = toCalendar(
			new CalendarDateTime(2026, 9, 7, 9, 30, 15, 125),
			createCalendar('hebrew')
		);
		const rules = constraints({ minValue: hebrew.subtract({ days: 1 }) });

		expect(() => validateDateTimePickerConstraints(rules)).not.toThrow();
		expect(isDateTimePickerValue(hebrew, 'local')).toBe(true);
		const parts = dateTimePickerParts(hebrew, rules);
		const candidate = composeDateTimePickerCandidate(
			parts.date,
			new Time(10, 45, 15, 125),
			hebrew,
			rules
		);
		expect(candidate?.calendar.identifier).toBe('hebrew');
		expect(candidate?.era).toBe(hebrew.era);
		expect(resolveDateTimePickerPreset({ label: 'Hebrew', value: hebrew }, rules)).toBe(hebrew);
		expect(
			resolveDateTimePickerPreset(
				{ label: 'Projected', value: new CalendarDateTime(2026, 9, 8, 11) },
				rules,
				hebrew
			)?.calendar.identifier
		).toBe('hebrew');
	});

	it('preserves a local reference calendar when creating Now and defaults to Gregorian without one', () => {
		const reference = toCalendar(new CalendarDateTime(2026, 9, 7, 9), createCalendar('hebrew'));
		const instant = new Date('2026-09-07T12:30:15.125Z');
		const international = dateTimePickerNow(constraints(), instant, reference);
		const fallback = dateTimePickerNow(constraints(), instant);

		expect(international?.calendar.identifier).toBe('hebrew');
		expect(international?.era).toBe(reference.era);
		expect(fallback?.calendar.identifier).toBe('gregory');
	});

	it('preserves a zoned reference calendar, owner zone and instant when creating Now', () => {
		const reference = toCalendar(
			parseZonedDateTime('2026-09-07T09:30-04:00[America/New_York]'),
			createCalendar('hebrew')
		);
		const instant = new Date('2026-09-07T12:30:15.125Z');
		const candidate = dateTimePickerNow(
			constraints({ mode: 'zoned', timeZone: 'Asia/Jerusalem' }),
			instant,
			reference
		);
		if (!(candidate instanceof ZonedDateTime)) throw new Error('Expected a zoned Now candidate.');

		expect(candidate.calendar.identifier).toBe('hebrew');
		expect(candidate.era).toBe(reference.era);
		expect(candidate.timeZone).toBe('America/New_York');
		expect(candidate.toDate().getTime()).toBe(instant.getTime());
	});

	it('treats the same instant in a different calendar as an external owner change', () => {
		const gregorian = parseZonedDateTime('2026-09-07T09:30-04:00[America/New_York]');
		const hebrew = toCalendar(gregorian, createCalendar('hebrew'));
		expect(gregorian.compare(hebrew)).toBe(0);
		expect(sameDateTimePickerValue(gregorian, hebrew)).toBe(false);
		expect(
			sameDateTimeRangeValue(
				{ start: gregorian, end: gregorian.add({ hours: 1 }) },
				{ start: hebrew, end: hebrew.add({ hours: 1 }) }
			)
		).toBe(false);
	});
});
