import { Time } from '@internationalized/date';
import { describe, expect, it } from 'vitest';

import {
	initialTimePickerReference,
	selectTimePickerPart,
	type TimePickerConstraints
} from '../src/runtime/time-picker.js';

function constraints(overrides: Partial<TimePickerConstraints> = {}): TimePickerConstraints {
	return {
		granularity: 'minute',
		hourCycle: 24,
		minuteStep: 1,
		secondStep: 1,
		...overrides
	};
}

describe('time picker finite-column resolution', () => {
	it('finds precise hidden units for an empty hour picker without materializing an all-day array', () => {
		const reference = initialTimePickerReference(
			null,
			constraints({
				granularity: 'hour',
				maxValue: new Time(10, 45),
				minValue: new Time(10, 30)
			})
		);
		expect(reference?.toString()).toBe('10:30:00');
	});

	it('preserves hidden units for an existing hour value and searches editable downstream columns', () => {
		const hourValue = new Time(9, 37, 12, 25);
		expect(
			selectTimePickerPart(hourValue, 'hour', 10, constraints({ granularity: 'hour' }))?.toString()
		).toBe('10:37:12.025');
		expect(selectTimePickerPart(hourValue, 'hour', 10, constraints())?.toString()).toBe(
			'10:37:12.025'
		);
		expect(
			selectTimePickerPart(
				hourValue,
				'minute',
				38,
				constraints({ granularity: 'second' })
			)?.toString()
		).toBe('09:38:12.025');

		const adjusted = selectTimePickerPart(
			new Time(9, 0),
			'hour',
			10,
			constraints({
				isTimeUnavailable: (value) => value.compare(new Time(10, 30)) !== 0
			})
		);
		expect(adjusted?.toString()).toBe('10:30:00');
	});

	it('preserves the displayed hour when switching either day period', () => {
		const rules = constraints({ hourCycle: 12 });
		expect(selectTimePickerPart(new Time(9, 30), 'dayPeriod', 'pm', rules)?.toString()).toBe(
			'21:30:00'
		);
		expect(selectTimePickerPart(new Time(21, 30), 'dayPeriod', 'am', rules)?.toString()).toBe(
			'09:30:00'
		);
	});

	it('returns null only when no complete stepped combination is available', () => {
		expect(
			initialTimePickerReference(
				null,
				constraints({ isTimeUnavailable: () => true, minuteStep: 15 })
			)
		).toBeNull();
	});
});
