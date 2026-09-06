import { Time } from '@internationalized/date';

import type { ZTimePickerProps } from '../src/components/input/ZTimePicker.svelte';

const controlled = {
	granularity: 'second',
	hourCycle: 24,
	minuteStep: 5,
	secondStep: 10,
	value: new Time(10, 30, 20)
} satisfies ZTimePickerProps;
const empty = { value: null } satisfies ZTimePickerProps;
const constrained = {
	isTimeUnavailable: (value: Time) => value.hour < 9,
	maxValue: new Time(17),
	minValue: new Time(9)
} satisfies ZTimePickerProps;
// @ts-expect-error Native Date is not a wall-clock Time value.
const nativeDate = { value: new Date() } satisfies ZTimePickerProps;
// @ts-expect-error Granularity is a closed display-axis union.
const millisecond = { granularity: 'millisecond' } satisfies ZTimePickerProps;
// @ts-expect-error Hour cycle is explicitly 12 or 24.
const invalidCycle = { hourCycle: 23 } satisfies ZTimePickerProps;

void [controlled, empty, constrained, nativeDate, millisecond, invalidCycle];
