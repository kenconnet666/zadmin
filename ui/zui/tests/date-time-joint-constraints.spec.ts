import {
	CalendarDate,
	CalendarDateTime,
	Time,
	parseZonedDateTime,
	toTimeZone
} from '@internationalized/date';
import { describe, expect, it } from 'vitest';

import {
	composeDateTimePickerCandidate,
	dateTimePickerDateUnavailable,
	initialDateTimePickerTime,
	resolveDateTimePickerPreset,
	type DateTimePickerConstraints
} from '../src/runtime/date-time-picker.js';
import {
	sameDateTimeRangeValue,
	validateDateTimeRangeValue,
	type DateTimeRangeConstraints
} from '../src/runtime/date-time-range.js';
import {
	initialTimePickerReference,
	type TimePickerConstraints
} from '../src/runtime/time-picker.js';

function localConstraints(
	overrides: Partial<DateTimePickerConstraints> = {}
): DateTimePickerConstraints {
	return {
		disambiguation: 'compatible',
		granularity: 'hour',
		hourCycle: 24,
		minuteStep: 1,
		mode: 'local',
		secondStep: 1,
		timeZone: 'America/New_York',
		...overrides
	};
}

describe('date-time joint constraints', () => {
	it('keeps a partially available boundary day enabled and finds its hidden exact precision', () => {
		const minValue = new CalendarDateTime(2026, 9, 7, 10, 30, 15, 125);
		const maxValue = new CalendarDateTime(2026, 9, 7, 10, 45, 15, 250);
		const rules = localConstraints({ minValue, maxValue });
		const date = new CalendarDate(2026, 9, 7);
		const reference = new CalendarDateTime(2026, 9, 7, 9);

		expect(dateTimePickerDateUnavailable(date, rules)).toBe(false);
		expect(initialDateTimePickerTime(date, reference, rules)?.toString()).toBe('10:30:15.125');
	});

	it('samples millisecond boundary precision for an empty Time picker without clamping', () => {
		const rules: TimePickerConstraints = {
			granularity: 'hour',
			hourCycle: 24,
			maxValue: new Time(10, 30, 15, 250),
			minValue: new Time(10, 30, 15, 125),
			minuteStep: 1,
			secondStep: 1
		};
		expect(initialTimePickerReference(null, rules, new Time(9))?.toString()).toBe('10:30:15.125');
	});

	it('preserves an explicit fold instant and rejects gap candidates under reject disambiguation', () => {
		const fold = parseZonedDateTime('2026-11-01T01:30-05:00[America/New_York]');
		const foldRules = localConstraints({ disambiguation: 'reject', mode: 'zoned' });
		expect(
			composeDateTimePickerCandidate(
				new CalendarDate(2026, 11, 1),
				new Time(1, 30),
				fold,
				foldRules
			)
		).toBe(fold);
		expect(
			composeDateTimePickerCandidate(new CalendarDate(2026, 3, 8), new Time(2, 30), fold, foldRules)
		).toBeNull();
	});

	it('orders zoned range endpoints by their resolved fold instants', () => {
		const start = parseZonedDateTime('2026-11-01T01:30-04:00[America/New_York]');
		const end = parseZonedDateTime('2026-11-01T01:15-05:00[America/New_York]');
		const rules: DateTimeRangeConstraints<'zoned'> = {
			allowEmpty: false,
			mode: 'zoned',
			order: 'strict'
		};
		expect(validateDateTimeRangeValue({ start, end }, rules)).toEqual({ valid: true });
	});

	it('does not erase an external zoned range owner change at the same instant', () => {
		const utc = parseZonedDateTime('2026-09-07T12:00+00:00[UTC]');
		const newYork = toTimeZone(utc, 'America/New_York');
		expect(utc.compare(newYork)).toBe(0);
		expect(
			sameDateTimeRangeValue(
				{ start: utc, end: utc.add({ hours: 1 }) },
				{ start: newYork, end: toTimeZone(utc.add({ hours: 1 }), 'America/New_York') }
			)
		).toBe(false);
	});

	it('rejects an unavailable preset exactly once without substituting a boundary value', () => {
		let calls = 0;
		const rules = localConstraints({
			maxValue: new CalendarDateTime(2026, 9, 7, 17),
			minValue: new CalendarDateTime(2026, 9, 7, 10)
		});
		const result = resolveDateTimePickerPreset(
			{
				label: 'Before boundary',
				value: () => {
					calls += 1;
					return new CalendarDateTime(2026, 9, 7, 9, 59, 59, 999);
				}
			},
			rules
		);
		expect(result).toBeNull();
		expect(calls).toBe(1);
	});
});
