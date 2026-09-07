import { CalendarDateTime, parseZonedDateTime } from '@internationalized/date';
import type { ComponentProps } from 'svelte';

import ZDateTimeField, {
	type ZDateTimeFieldProps
} from '../src/components/input/ZDateTimeField.svelte';
import ZDateTimePicker, {
	type ZDateTimePickerProps
} from '../src/components/input/ZDateTimePicker.svelte';
import ZDateTimeRangePicker, {
	type ZDateTimeRangePickerProps
} from '../src/components/input/ZDateTimeRangePicker.svelte';

const local = new CalendarDateTime(2026, 9, 7, 9, 30);
const zoned = parseZonedDateTime('2026-09-07T09:30-04:00[America/New_York]');

const fieldLocal = {
	value: local,
	onValueChange: (value) => value?.hour
} satisfies ComponentProps<typeof ZDateTimeField>;
const fieldZoned = {
	mode: 'zoned',
	value: zoned,
	onValueChange: (value) => value?.timeZone
} satisfies ComponentProps<typeof ZDateTimeField>;
const fieldZonedAlias = {
	mode: 'zoned',
	value: zoned
} satisfies ZDateTimeFieldProps<'zoned'>;
const fieldMissingMode = {
	value: zoned
};
// @ts-expect-error Zoned values require the direct mode discriminator.
const invalidFieldMissingMode: ComponentProps<typeof ZDateTimeField> = fieldMissingMode;

const pickerLocalInline = {
	presentation: 'inline',
	value: local,
	onCommit: (value) => value?.minute
} satisfies ComponentProps<typeof ZDateTimePicker>;
const pickerZonedInline = {
	mode: 'zoned',
	presentation: 'inline',
	value: zoned,
	onCommit: (value) => value?.timeZone
} satisfies ComponentProps<typeof ZDateTimePicker>;
const pickerZonedAlias = {
	mode: 'zoned',
	presentation: 'popover',
	open: true,
	value: zoned
} satisfies ZDateTimePickerProps<'zoned', 'popover'>;
const inlineWithOpen = {
	presentation: 'inline',
	open: true,
	value: local
};
// @ts-expect-error Inline presentation has no popup open owner.
const invalidInlineOpen: ComponentProps<typeof ZDateTimePicker> = inlineWithOpen;

const rangeLocalInline = {
	presentation: 'inline',
	value: { start: local, end: local.add({ hours: 1 }) },
	onValueChange: (value) => value?.end?.hour
} satisfies ComponentProps<typeof ZDateTimeRangePicker>;
const rangeZonedInline = {
	mode: 'zoned',
	presentation: 'inline',
	value: { start: zoned, end: zoned.add({ hours: 1 }) },
	onValueChange: (value) => value?.start?.timeZone
} satisfies ComponentProps<typeof ZDateTimeRangePicker>;
const rangeZonedAlias = {
	mode: 'zoned',
	presentation: 'popover',
	open: true,
	value: { start: zoned, end: null }
} satisfies ZDateTimeRangePickerProps<'zoned', 'popover'>;
const rangeModeDrift = {
	mode: 'zoned',
	presentation: 'inline',
	value: { start: local, end: null }
};
// @ts-expect-error Zoned ranges require ZonedDateTime endpoints.
const invalidRangeModeDrift: ComponentProps<typeof ZDateTimeRangePicker> = rangeModeDrift;

void [
	fieldLocal,
	fieldZoned,
	fieldZonedAlias,
	invalidFieldMissingMode,
	pickerLocalInline,
	pickerZonedInline,
	pickerZonedAlias,
	invalidInlineOpen,
	rangeLocalInline,
	rangeZonedInline,
	rangeZonedAlias,
	invalidRangeModeDrift
];
