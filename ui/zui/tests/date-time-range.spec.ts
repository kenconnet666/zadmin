import { CalendarDateTime, parseZonedDateTime } from '@internationalized/date';
import { describe, expect, it } from 'vitest';

import {
	normalizeDateTimeRangeModelValue,
	resolveDateTimeRangeCandidate,
	resolveDateTimeRangePreset,
	validateDateTimeRangeValue,
	type DateTimeRangeConstraints,
	type LocalDateTimeRangeValue
} from '../src/runtime/date-time-range.js';

const local = (day: number, hour: number) => new CalendarDateTime(2026, 9, day, hour);
const range = (startDay: number, endDay: number): LocalDateTimeRangeValue => ({
	start: local(startDay, 9),
	end: local(endDay, 17)
});
const constraints = (
	overrides: Partial<DateTimeRangeConstraints<'local'>> = {}
): DateTimeRangeConstraints<'local'> => ({
	allowEmpty: false,
	mode: 'local',
	order: 'strict',
	...overrides
});

describe('date-time range runtime', () => {
	it('preserves nullable endpoints and rejects mode drift', () => {
		expect(
			normalizeDateTimeRangeModelValue({ start: local(7, 9), end: null }, 'local')?.start
		).toEqual(local(7, 9));
		expect(() =>
			normalizeDateTimeRangeModelValue(
				{ start: parseZonedDateTime('2026-09-07T09:00Z[UTC]'), end: null },
				'local'
			)
		).toThrow(/CalendarDateTime/u);
	});

	it('keeps strict candidates ordered and remaps the edited endpoint when swap is explicit', () => {
		const current = range(7, 8);
		expect(
			resolveDateTimeRangeCandidate(current, 'start', local(9, 9), constraints())
		).toBeUndefined();
		const swapped = resolveDateTimeRangeCandidate(
			current,
			'start',
			local(9, 9),
			constraints({ order: 'swap' })
		)!;
		expect(swapped.part).toBe('end');
		expect(swapped.range?.start).toEqual(local(8, 17));
		expect(swapped.range?.end).toEqual(local(9, 9));
		expect(
			validateDateTimeRangeValue(
				{ start: local(9, 9), end: local(8, 17) },
				constraints({ order: 'swap' })
			)
		).toEqual({
			reason: 'order',
			valid: false
		});
	});

	it('validates the reordered whole range and endpoint role against joint availability', () => {
		const seen: string[] = [];
		const rules = constraints({
			order: 'swap',
			isDateTimeUnavailable: (value, part, candidate) => {
				seen.push(`${part}:${value.day}:${candidate.start?.day}-${candidate.end?.day}`);
				return part === 'end' && value.hour === 12;
			}
		});
		const resolved = resolveDateTimeRangeCandidate(range(7, 8), 'start', local(9, 12), rules);
		expect(resolved).toBeUndefined();
		expect(seen).toContain('end:9:8-9');
	});

	it('lets partial values remain representable while allowEmpty controls final validity', () => {
		const partial = { start: local(7, 9), end: null } satisfies LocalDateTimeRangeValue;
		expect(validateDateTimeRangeValue(partial, constraints())).toEqual({
			reason: 'partial',
			valid: false
		});
		expect(validateDateTimeRangeValue(partial, constraints({ allowEmpty: true }))).toEqual({
			valid: true
		});
	});

	it('resolves lazy presets exactly and swaps only complete reversed presets', () => {
		const reversed = { start: local(9, 9), end: local(8, 17) };
		expect(
			resolveDateTimeRangePreset({ label: 'Strict', value: () => reversed }, constraints())
		).toBeUndefined();
		const swapped = resolveDateTimeRangePreset(
			{ label: 'Swap', value: reversed },
			constraints({ order: 'swap' })
		)!;
		expect(swapped.start).toEqual(local(8, 17));
		expect(swapped.end).toEqual(local(9, 9));
	});

	it('rejects min/max values whose runtime type drifts from the discriminated mode', () => {
		expect(() =>
			validateDateTimeRangeValue(
				range(7, 8),
				constraints({
					minValue: parseZonedDateTime('2026-09-07T09:00Z[UTC]') as never
				})
			)
		).toThrow(/CalendarDateTime/u);
	});
});
