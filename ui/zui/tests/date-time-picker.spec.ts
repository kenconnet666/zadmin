import {
	CalendarDate,
	CalendarDateTime,
	Time,
	ZonedDateTime,
	parseZonedDateTime,
	toTimeZone
} from '@internationalized/date';
import { describe, expect, it } from 'vitest';

import {
	composeDateTimePickerCandidate,
	dateTimePickerCalendarBounds,
	dateTimePickerDateUnavailable,
	dateTimePickerNow,
	dateTimePickerTimeConstraints,
	dateTimePickerValueAvailable,
	resolveDateTimePickerPreset,
	type DateTimePickerConstraints
} from '../src/runtime/date-time-picker.js';
import { timePickerValueAvailable } from '../src/runtime/time-picker.js';

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
		timeZone: 'America/New_York',
		...overrides
	};
}

describe('date-time picker runtime', () => {
	it('preserves an already-resolved DST fold on no-op confirmation even under reject policy', () => {
		const reference = parseZonedDateTime('2026-11-01T01:30-04:00[America/New_York]');
		const options = constraints({ mode: 'zoned', disambiguation: 'reject' });
		expect(
			composeDateTimePickerCandidate(
				new CalendarDate(2026, 11, 1),
				new Time(1, 30),
				reference,
				options
			)
		).toBe(reference);
		expect(
			composeDateTimePickerCandidate(
				new CalendarDate(2026, 11, 1),
				new Time(1, 31),
				reference,
				options
			)
		).toBeNull();
	});
	it('composes in the display zone while preserving a zoned reference owner', () => {
		const reference = parseZonedDateTime('2026-09-07T09:30-07:00[America/Los_Angeles]');
		const candidate = composeDateTimePickerCandidate(
			new CalendarDate(2026, 9, 8),
			new Time(13, 45),
			reference,
			constraints({ mode: 'zoned' })
		)!;
		if (!(candidate instanceof ZonedDateTime)) throw new Error('Expected zoned candidate.');
		expect(candidate.timeZone).toBe('America/Los_Angeles');
		expect(toTimeZone(candidate, 'America/New_York').hour).toBe(13);
	});

	it('returns null for rejected DST wall time and enforces complete-value constraints', () => {
		const rules = constraints({
			mode: 'zoned',
			disambiguation: 'reject',
			maxValue: parseZonedDateTime('2026-03-09T00:00[America/New_York]'),
			minValue: parseZonedDateTime('2026-03-01T00:00[America/New_York]')
		});
		expect(
			composeDateTimePickerCandidate(
				new CalendarDate(2026, 3, 8),
				new Time(2, 30),
				parseZonedDateTime('2026-03-07T12:00[America/New_York]'),
				rules
			)
		).toBeNull();
		expect(
			dateTimePickerValueAvailable(parseZonedDateTime('2026-03-10T00:00[America/New_York]'), rules)
		).toBe(false);
	});

	it('resolves typed presets and Now without crossing the selected mode', () => {
		const localRules = constraints({
			isDateTimeUnavailable: (value) => value.hour < 9
		});
		expect(
			resolveDateTimePickerPreset(
				{ label: 'Morning', value: () => new CalendarDateTime(2026, 9, 7, 10) },
				localRules
			)?.hour
		).toBe(10);
		expect(dateTimePickerNow(localRules, new Date('2026-09-07T14:30:00.000Z'))).toBeInstanceOf(
			CalendarDateTime
		);
		const instant = new Date('2026-09-07T00:30:15.125Z');
		const ownerNow = dateTimePickerNow(
			constraints({ mode: 'zoned', timeZone: 'Asia/Shanghai' }),
			instant,
			parseZonedDateTime('2026-09-07T09:30-04:00[America/New_York]')
		);
		if (!(ownerNow instanceof ZonedDateTime)) throw new Error('Expected zoned Now.');
		expect(ownerNow.timeZone).toBe('America/New_York');
		expect(ownerNow.toDate().getTime()).toBe(instant.getTime());
	});

	it('filters calendar days only by proven display bounds without scanning the joint predicate', () => {
		let predicateCalls = 0;
		const rules = constraints({
			isDateTimeUnavailable: () => {
				predicateCalls += 1;
				return true;
			},
			maxValue: new CalendarDateTime(2026, 9, 10, 17),
			minValue: new CalendarDateTime(2026, 9, 8, 9)
		});
		const bounds = dateTimePickerCalendarBounds(rules);
		expect(bounds.maxValue?.toString()).toBe('2026-09-10');
		expect(bounds.minValue?.toString()).toBe('2026-09-08');
		expect(dateTimePickerDateUnavailable(new CalendarDate(2026, 9, 7), rules)).toBe(true);
		expect(dateTimePickerDateUnavailable(new CalendarDate(2026, 9, 9), rules)).toBe(false);
		expect(predicateCalls).toBe(0);
	});

	it('keeps another time reachable when the selected date current time is unavailable', () => {
		const date = new CalendarDate(2026, 9, 8);
		const reference = new CalendarDateTime(2026, 9, 8, 9, 30, 15, 125);
		const rules = constraints({
			granularity: 'second',
			isDateTimeUnavailable: (candidate) => candidate.hour === 9
		});
		const timeRules = dateTimePickerTimeConstraints(date, reference, rules);
		expect(timePickerValueAvailable(new Time(9, 30, 15, 125), timeRules)).toBe(false);
		expect(timePickerValueAvailable(new Time(10, 30, 15, 125), timeRules)).toBe(true);
	});
});
