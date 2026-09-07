import { CalendarDate, Time } from '@internationalized/date';

import type { ZCalendarProps } from '../src/components/input/ZCalendar.svelte';
import type { ZDateFieldProps } from '../src/components/input/ZDateField.svelte';
import type { ZDatePickerProps } from '../src/components/input/ZDatePicker.svelte';
import type { ZDateRangePickerProps } from '../src/components/input/ZDateRangePicker.svelte';
import type { ZFormController, ZFormProps } from '../src/components/input/ZForm.svelte';
import type { ZTimeFieldProps } from '../src/components/input/ZTimeField.svelte';
import type { CalendarRangeValue } from '../src/runtime/date.js';
import { createFormModel } from '../src/runtime/form/form-model.svelte.js';

interface DateValues {
	readonly calendar: CalendarDate | null;
	readonly date: CalendarDate | null;
	readonly picker: CalendarDate | null;
	readonly range: CalendarRangeValue | null;
	readonly time: Time | null;
}

const values: DateValues = {
	calendar: new CalendarDate(2026, 9, 7),
	date: null,
	picker: new CalendarDate(2026, 9, 8),
	range: { start: new CalendarDate(2026, 9, 9), end: null },
	time: new Time(9, 30, 45, 125)
};
const model = createFormModel<DateValues>({
	defaultValues: values,
	onValuesChange(detail) {
		void detail.values.calendar?.add({ days: 1 });
		void detail.values.time?.cycle('hour', 1);
	}
});
const missingModel = createFormModel<{
	readonly date?: CalendarDate | null;
	readonly range?: CalendarRangeValue | null;
	readonly time?: Time | null;
}>({ defaultValues: {} });
const form = { model } satisfies ZFormProps<undefined, DateValues>;
declare const controller: ZFormController<DateValues, DateValues>;
controller.setFieldValue('calendar', new CalendarDate(2026, 9, 10));
controller.setFieldValue('time', new Time(10));
controller.setFieldValue('range', { start: null, end: new CalendarDate(2026, 9, 11) });

const calendar = { value: new CalendarDate(2026, 9, 7) } satisfies ZCalendarProps;
const dateField = { value: null } satisfies ZDateFieldProps;
const timeField = { granularity: 'hour', value: new Time(9, 30) } satisfies ZTimeFieldProps;
const picker = { value: new CalendarDate(2026, 9, 8) } satisfies ZDatePickerProps;
const range = {
	value: { start: new CalendarDate(2026, 9, 9), end: null }
} satisfies ZDateRangePickerProps;

// @ts-expect-error Native Date is not a CalendarDate value.
const wrongPicker = { value: new Date() } satisfies ZDatePickerProps;
const wrongRange = {
	// @ts-expect-error Range endpoints are explicitly nullable, not omittable.
	value: { start: new CalendarDate(2026, 9, 9) }
} satisfies ZDateRangePickerProps;
// @ts-expect-error TimeField granularity is a closed public union.
const wrongGranularity = { granularity: 'millisecond' } satisfies ZTimeFieldProps;

void [
	form,
	missingModel,
	controller,
	calendar,
	dateField,
	timeField,
	picker,
	range,
	wrongPicker,
	wrongRange,
	wrongGranularity
];
