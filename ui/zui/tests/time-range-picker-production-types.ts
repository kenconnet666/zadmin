import { Time } from '@internationalized/date';

import type { ZTimeRangePickerProps } from '../src/components/input/ZTimeRangePicker.svelte';
import type { TimeRangePickerPreset, TimeRangeValue } from '../src/runtime/time-range.js';

const partial = { start: new Time(9), end: null } satisfies TimeRangeValue;
const automaticDirection = { dir: 'auto' } satisfies ZTimeRangePickerProps;
const preset = {
	label: 'Night shift',
	value: () => ({ start: new Time(23), end: new Time(7) })
} satisfies TimeRangePickerPreset;
const overnight = {
	allowEmpty: true,
	defaultValue: partial,
	isTimeUnavailable: (candidate: Time, part: 'start' | 'end', range: TimeRangeValue) =>
		part === 'end' && range.start?.compare(candidate) === 0,
	onCommit: (value: TimeRangeValue | null) => value?.end?.toString(),
	nowLabel: 'Current time',
	presets: [preset],
	rangeMode: 'overnight',
	showNow: true,
	value: { start: new Time(23), end: new Time(1) }
} satisfies ZTimeRangePickerProps;
// @ts-expect-error Native Date endpoints are not wall-clock Time values.
const nativeDate = { value: { start: new Date(), end: null } } satisfies ZTimeRangePickerProps;
// @ts-expect-error Both endpoint keys are required even for a partial value.
const missingEndpoint = { value: { start: new Time(9) } } satisfies ZTimeRangePickerProps;
// @ts-expect-error Range semantics are an explicit closed union.
const implicitOrder = { rangeMode: 'preserve' } satisfies ZTimeRangePickerProps;

void [automaticDirection, overnight, nativeDate, missingEndpoint, implicitOrder];
