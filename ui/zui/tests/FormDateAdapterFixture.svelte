<script lang="ts">
	import { CalendarDate, Time } from '@internationalized/date';
	import ZCalendar from '../src/components/input/ZCalendar.svelte';
	import ZDateField from '../src/components/input/ZDateField.svelte';
	import ZDatePicker from '../src/components/input/ZDatePicker.svelte';
	import ZDateRangePicker from '../src/components/input/ZDateRangePicker.svelte';
	import ZForm, { type ZFormController } from '../src/components/input/ZForm.svelte';
	import ZFormField from '../src/components/input/ZFormField.svelte';
	import ZTimeField from '../src/components/input/ZTimeField.svelte';
	import ZProvider from '../src/components/gene/ZProvider.svelte';
	import { createFormModel, type FormValuesChange } from '../src/runtime/form/form-model.svelte.js';
	import type { CalendarRangeValue } from '../src/runtime/date.js';

	interface DateValues {
		calendar: CalendarDate | null;
		dateField: CalendarDate | null;
		disabledDate: CalendarDate | null;
		picker: CalendarDate | null;
		range: CalendarRangeValue | null;
		readonlyDate: CalendarDate | null;
		timeField: Time | null;
	}

	const defaults: DateValues = {
		calendar: new CalendarDate(2026, 9, 10),
		dateField: new CalendarDate(2026, 9, 11),
		disabledDate: new CalendarDate(2026, 9, 12),
		picker: new CalendarDate(2026, 9, 13),
		range: { start: new CalendarDate(2026, 9, 14), end: null },
		readonlyDate: new CalendarDate(2026, 9, 15),
		timeField: new Time(9, 30, 45, 125)
	};
	let owner = $state<DateValues>({ ...defaults });
	let controller = $state<ZFormController<DateValues, DateValues> | null>(null);
	let modelChanges = $state<readonly FormValuesChange<DateValues>[]>([]);
	let controlChanges = $state(0);
	const model = createFormModel<DateValues>({
		defaultValues: defaults,
		onValuesChange: (detail) => (modelChanges = [...modelChanges, detail]),
		read: () => owner,
		write: (next) => (owner = next)
	});

	const rejectedDefaults: DateValues = {
		calendar: new CalendarDate(2026, 9, 10),
		dateField: new CalendarDate(2026, 9, 11),
		disabledDate: new CalendarDate(2026, 9, 12),
		picker: new CalendarDate(2026, 9, 13),
		range: {
			start: new CalendarDate(2026, 9, 14),
			end: new CalendarDate(2026, 9, 16)
		},
		readonlyDate: new CalendarDate(2026, 9, 15),
		timeField: new Time(9, 30, 45, 125)
	};
	const rejectedOwner = $state<DateValues>({ ...rejectedDefaults });
	const rejectedModel = createFormModel<DateValues>({
		defaultValues: rejectedDefaults,
		read: () => rejectedOwner,
		write: () => undefined
	});
	interface MissingDateValues {
		addedDate?: CalendarDate | null;
		addedRange?: CalendarRangeValue | null;
		addedTime?: Time | null;
	}
	let missingModelChanges = $state(0);
	let missingControlChanges = $state(0);
	const missingModel = createFormModel<MissingDateValues>({
		defaultValues: {},
		onValuesChange: () => (missingModelChanges += 1)
	});

	export function updateThroughController(): void {
		controller?.setFieldValue('calendar', new CalendarDate(2026, 9, 20));
		controller?.setFieldValue('dateField', null);
		controller?.setFieldValue('picker', new CalendarDate(2026, 9, 21));
		controller?.setFieldValue('range', {
			start: null,
			end: new CalendarDate(2026, 9, 22)
		});
		controller?.setFieldValue('timeField', new Time(17, 5, 6, 7));
	}

	export function returnEquivalentBaselines(): void {
		controller?.setFieldValue('calendar', new CalendarDate(2026, 9, 10));
		controller?.setFieldValue('dateField', new CalendarDate(2026, 9, 11));
		controller?.setFieldValue('picker', new CalendarDate(2026, 9, 13));
		controller?.setFieldValue('range', {
			start: new CalendarDate(2026, 9, 14),
			end: null
		});
		controller?.setFieldValue('timeField', new Time(9, 30, 45, 125));
	}

	const dateWindow = {
		minValue: new CalendarDate(2026, 9, 1),
		maxValue: new CalendarDate(2026, 9, 30)
	};
	const changed = () => (controlChanges += 1);
	const dateText = (value: CalendarDate | null) => value?.toString() ?? 'null';
	const rangeText = (value: CalendarRangeValue | null) =>
		`${dateText(value?.start ?? null)}..${dateText(value?.end ?? null)}`;
</script>

<ZForm bind:controller {model} data-testid="date-model-form">
	<ZFormField name="calendar" label="Calendar">
		<ZCalendar
			{...dateWindow}
			data-testid="model-calendar"
			locale="en-US"
			onValueChange={changed}
			timeZone="UTC"
		/>
	</ZFormField>
	<ZFormField name="dateField" label="Date field">
		<ZDateField
			{...dateWindow}
			data-testid="model-date-field"
			locale="en-US"
			onValueChange={changed}
			timeZone="UTC"
		/>
	</ZFormField>
	<ZFormField name="timeField" label="Time field">
		<ZTimeField
			data-testid="model-time-field"
			granularity="hour"
			hourCycle={24}
			locale="en-US"
			minValue={new Time(8)}
			maxValue={new Time(18, 59, 59, 999)}
			onValueChange={changed}
		/>
	</ZFormField>
	<ZFormField name="picker" label="Date picker">
		<ZDatePicker
			{...dateWindow}
			data-testid="model-date-picker"
			locale="en-US"
			onValueChange={changed}
			timeZone="UTC"
		/>
	</ZFormField>
	<ZFormField name="range" label="Date range">
		<ZDateRangePicker
			{...dateWindow}
			data-testid="model-date-range"
			locale="en-US"
			onValueChange={changed}
			timeZone="UTC"
		/>
	</ZFormField>
	<ZFormField name="readonlyDate" label="Readonly date">
		<ZDateField data-testid="model-readonly-date" locale="en-US" readonly />
	</ZFormField>
	<ZFormField name="disabledDate" label="Disabled date">
		<ZDatePicker data-testid="model-disabled-date" disabled locale="en-US" />
	</ZFormField>
	<button type="reset">Reset date model</button>
</ZForm>

<ZForm model={rejectedModel} data-testid="date-rejected-form">
	<ZFormField name="calendar" label="Rejected calendar">
		<ZCalendar data-testid="rejected-calendar" locale="en-US" timeZone="UTC" />
	</ZFormField>
	<ZFormField name="dateField" label="Rejected date field">
		<ZDateField data-testid="rejected-date-field" locale="en-US" timeZone="UTC" />
	</ZFormField>
	<ZFormField name="timeField" label="Rejected time field">
		<ZTimeField
			data-testid="rejected-time-field"
			granularity="hour"
			hourCycle={24}
			locale="en-US"
		/>
	</ZFormField>
	<ZFormField name="picker" label="Rejected picker">
		<ZDatePicker data-testid="rejected-picker" locale="en-US" timeZone="UTC" />
	</ZFormField>
	<ZFormField name="range" label="Rejected range">
		<ZDateRangePicker data-testid="rejected-range" locale="en-US" timeZone="UTC" />
	</ZFormField>
	<button type="reset">Reset rejected date model</button>
</ZForm>

<ZForm model={missingModel} data-testid="date-missing-form">
	<ZFormField name="addedDate" label="Added date">
		<ZDateField
			data-testid="missing-date-field"
			locale="en-US"
			onValueChange={() => (missingControlChanges += 1)}
		/>
	</ZFormField>
	<ZFormField name="addedTime" label="Added time">
		<ZTimeField
			data-testid="missing-time-field"
			granularity="hour"
			hourCycle={24}
			locale="en-US"
			onValueChange={() => (missingControlChanges += 1)}
		/>
	</ZFormField>
	<ZFormField name="addedRange" label="Added range">
		<ZDateRangePicker
			data-testid="missing-date-range"
			locale="en-US"
			onValueChange={() => (missingControlChanges += 1)}
		/>
	</ZFormField>
	<button type="reset">Reset missing dates</button>
</ZForm>

<output data-testid="date-values"
	>{dateText(owner.calendar)}|{dateText(owner.dateField)}|{owner.timeField?.toString() ??
		'null'}|{dateText(owner.picker)}|{rangeText(owner.range)}</output
>
<output data-testid="date-counts">{modelChanges.length}:{controlChanges}</output>
<output data-testid="date-dirty"
	>{String(model.dirty)}|{String(model.isDirty('calendar'))}|{String(
		model.isDirty('dateField')
	)}|{String(model.isDirty('timeField'))}|{String(model.isDirty('picker'))}|{String(
		model.isDirty('range')
	)}</output
>
<output data-testid="missing-date-counts">{missingModelChanges}:{missingControlChanges}</output>

<ZProvider
	componentDefaults={{
		calendar: { size: 'xsmall' },
		dateField: { size: 'small' },
		datePicker: { size: 'large' },
		dateRangePicker: { size: 'xlarge' },
		input: { size: 'xlarge' },
		timeField: { size: 'medium' }
	}}
>
	<div data-testid="date-component-defaults">
		<ZCalendar data-testid="default-calendar" />
		<ZDateField data-testid="default-date-field" />
		<ZTimeField data-testid="default-time-field" />
		<ZDatePicker data-testid="default-date-picker" />
		<ZDateRangePicker data-testid="default-date-range" />
		<ZForm>
			<ZFormField name="fieldOverride" label="Field override" size="xsmall">
				<ZDatePicker data-testid="field-override-date-picker" />
			</ZFormField>
		</ZForm>
	</div>
</ZProvider>
