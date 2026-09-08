<script lang="ts">
	import ZProvider from '../src/components/gene/ZProvider.svelte';
	import ZForm, { type ZFormController } from '../src/components/input/ZForm.svelte';
	import ZFormField from '../src/components/input/ZFormField.svelte';
	import ZPeriodPicker from '../src/components/input/ZPeriodPicker.svelte';
	import { createFormModel } from '../src/runtime/form/form-model.svelte.js';
	import {
		monthPeriod,
		quarterPeriod,
		serializePeriod,
		weekPeriod,
		yearPeriod,
		type MonthPeriod,
		type PeriodRangeValue,
		type QuarterPeriod,
		type YearPeriod
	} from '../src/runtime/period.js';

	const initialMonth = monthPeriod(2026, 5);
	let single = $state<MonthPeriod | null>(initialMonth);
	let singleOpen = $state(false);
	let singleChanges = $state(0);
	let singleCommits = $state(0);
	let multiple = $state<readonly QuarterPeriod[]>([
		quarterPeriod(2026, 1, 4),
		quarterPeriod(2026, 3, 4)
	]);
	let multipleOpen = $state(false);
	let multipleChanges = $state(0);
	let multipleCommits = $state(0);
	let range = $state<PeriodRangeValue<'week'> | null>(null);
	let rangeOpen = $state(false);
	let rangeChanges = $state(0);
	let rangeCommits = $state(0);
	let confirmRange = $state<PeriodRangeValue<'year'> | null>(null);
	let confirmRangeOpen = $state(false);
	let confirmPartial = $state<PeriodRangeValue<'year'> | null>(null);
	let confirmPartialOpen = $state(false);
	let confirmPartialChanges = $state(0);
	let confirmPartialCommits = $state(0);
	let partial = $state<PeriodRangeValue<'year'> | null>(null);
	let partialOpen = $state(false);
	let partialChanges = $state(0);
	let partialCommits = $state(0);
	let requiredCommits = $state(0);
	interface RequiredValues {
		period: YearPeriod | null;
	}
	const requiredModel = createFormModel<RequiredValues>({
		defaultValues: { period: yearPeriod(2026) }
	});
	let requiredController = $state<ZFormController<RequiredValues, RequiredValues> | null>(null);

	const rejectedInitial = monthPeriod(2026, 5);
	const rejectedOwner = $state({ period: rejectedInitial as MonthPeriod | null });
	const rejectedModel = createFormModel({
		defaultValues: { period: rejectedInitial as MonthPeriod | null },
		read: () => rejectedOwner,
		write: () => undefined
	});

	export function setExternalSingle(): void {
		single = monthPeriod(2027, 2);
	}

	export function validateRequired() {
		return requiredController!.validate();
	}

	function singleText(value: MonthPeriod | null): string {
		return value ? serializePeriod(value) : 'null';
	}

	function multipleText(value: readonly QuarterPeriod[]): string {
		return value.map(serializePeriod).join(',');
	}

	function rangeText(value: PeriodRangeValue<'week'> | null): string {
		return `${value?.start ? serializePeriod(value.start) : 'null'}..${value?.end ? serializePeriod(value.end) : 'null'}`;
	}

	function yearRangeText(value: PeriodRangeValue<'year'> | null): string {
		return `${value?.start?.year ?? 'null'}..${value?.end?.year ?? 'null'}`;
	}

	const sizes = ['xsmall', 'small', 'medium', 'large', 'xlarge'] as const;
</script>

<ZProvider direction="ltr" locale="en-US" timeZone="UTC">
	<form data-testid="period-picker-form">
		<ZPeriodPicker
			bind:open={singleOpen}
			bind:value={single}
			commitMode="confirm"
			controlId="period-single-trigger"
			data-testid="period-picker-single"
			defaultFocusedValue={initialMonth}
			defaultValue={initialMonth}
			granularity="month"
			name="month"
			onCommit={() => (singleCommits += 1)}
			onValueChange={() => (singleChanges += 1)}
		/>
		<ZPeriodPicker
			bind:open={multipleOpen}
			bind:value={multiple}
			data-testid="period-picker-multiple"
			defaultFocusedValue={quarterPeriod(2026, 1, 4)}
			defaultValue={[quarterPeriod(2026, 1, 4), quarterPeriod(2026, 3, 4)]}
			dir="rtl"
			fiscalYearStartMonth={4}
			granularity="quarter"
			name="quarters"
			onCommit={() => (multipleCommits += 1)}
			onValueChange={() => (multipleChanges += 1)}
			selectionMode="multiple"
		/>
		<ZPeriodPicker
			bind:open={rangeOpen}
			bind:value={range}
			data-testid="period-picker-range"
			defaultFocusedValue={weekPeriod(2026, 10, {
				firstDayOfWeek: 'sun',
				minimalDaysInFirstWeek: 1
			})}
			granularity="week"
			name="weeks"
			onCommit={() => (rangeCommits += 1)}
			onValueChange={() => (rangeChanges += 1)}
			selectionMode="range"
			showWeekNumbers
			weekRules={{ firstDayOfWeek: 'sun', minimalDaysInFirstWeek: 1 }}
		/>
		<ZPeriodPicker
			bind:open={confirmRangeOpen}
			bind:value={confirmRange}
			commitMode="confirm"
			data-testid="period-picker-confirm-range"
			defaultFocusedValue={yearPeriod(2025)}
			granularity="year"
			name="confirmYears"
			selectionMode="range"
		/>
		<ZPeriodPicker
			bind:open={confirmPartialOpen}
			bind:value={confirmPartial}
			allowEmpty
			commitMode="confirm"
			data-testid="period-picker-confirm-partial"
			defaultFocusedValue={yearPeriod(2025)}
			granularity="year"
			name="confirmPartialYears"
			onCommit={() => (confirmPartialCommits += 1)}
			onValueChange={() => (confirmPartialChanges += 1)}
			selectionMode="range"
		/>
		<ZPeriodPicker
			bind:open={partialOpen}
			bind:value={partial}
			allowEmpty
			data-testid="period-picker-partial"
			defaultFocusedValue={yearPeriod(2025)}
			granularity="year"
			name="partialYears"
			onCommit={() => (partialCommits += 1)}
			onValueChange={() => (partialChanges += 1)}
			selectionMode="range"
		/>
		<ZPeriodPicker
			data-testid="period-picker-readonly"
			granularity="year"
			readonly
			value={yearPeriod(2026)}
		/>
		<button type="reset">Reset period pickers</button>
	</form>
	{#each sizes as size (size)}
		<ZPeriodPicker
			data-testid={`period-picker-size-${size}`}
			granularity="month"
			{size}
			value={monthPeriod(2026, 5)}
		/>
	{/each}
	<ZForm
		bind:controller={requiredController}
		model={requiredModel}
		data-testid="period-picker-required-form"
	>
		<ZFormField label="Required period" name="period" required>
			<ZPeriodPicker
				data-testid="period-picker-required"
				granularity="year"
				onCommit={() => (requiredCommits += 1)}
			/>
		</ZFormField>
	</ZForm>
</ZProvider>

<ZForm model={rejectedModel} data-testid="period-picker-rejected-form">
	<ZFormField label="Rejected period" name="period">
		<ZPeriodPicker
			data-testid="period-picker-rejected"
			defaultFocusedValue={rejectedInitial}
			granularity="month"
		/>
	</ZFormField>
</ZForm>

<output data-testid="period-picker-single-output"
	>{singleText(single)}|{singleChanges}|{singleCommits}|{singleOpen}</output
>
<output data-testid="period-picker-multiple-output"
	>{multipleText(multiple)}|{multipleChanges}|{multipleCommits}|{multipleOpen}</output
>
<output data-testid="period-picker-range-output"
	>{rangeText(range)}|{rangeChanges}|{rangeCommits}|{rangeOpen}</output
>
<output data-testid="period-picker-confirm-range-output"
	>{yearRangeText(confirmRange)}|{confirmRangeOpen}</output
>
<output data-testid="period-picker-confirm-partial-output"
	>{yearRangeText(
		confirmPartial
	)}|{confirmPartialChanges}|{confirmPartialCommits}|{confirmPartialOpen}</output
>
<output data-testid="period-picker-partial-output"
	>{yearRangeText(partial)}|{partialChanges}|{partialCommits}|{partialOpen}</output
>
<output data-testid="period-picker-required-output"
	>{requiredModel.values.period?.year ?? 'null'}|{requiredCommits}</output
>
