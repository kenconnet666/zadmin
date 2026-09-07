<script lang="ts">
	import ZProvider from '../src/components/gene/ZProvider.svelte';
	import ZPeriodCalendar from '../src/components/input/ZPeriodCalendar.svelte';
	import {
		monthPeriod,
		quarterPeriod,
		weekPeriod,
		yearPeriod,
		type MonthPeriod,
		type PeriodRangeValue,
		type QuarterPeriod,
		type WeekPeriod,
		type YearPeriod
	} from '../src/runtime/period.js';

	const initialMonth = monthPeriod(2026, 5);
	let month = $state<MonthPeriod | null>(initialMonth);
	let quarters = $state<readonly QuarterPeriod[]>([
		quarterPeriod(2026, 1, 4),
		quarterPeriod(2026, 3, 4)
	]);
	let years = $state<PeriodRangeValue<'year'> | null>({
		end: null,
		start: yearPeriod(2025)
	});
	let weeks = $state<readonly WeekPeriod[]>([
		weekPeriod(2026, 10, { firstDayOfWeek: 'sun', minimalDaysInFirstWeek: 1 })
	]);
	let focused = $state<MonthPeriod>();
	let changes = $state(0);
	let focusChanges = $state(0);
	let rejected = $state<MonthPeriod | null>(initialMonth);
	let rejectedAttempts = $state(0);

	function readRejected(): MonthPeriod | null {
		return rejected;
	}

	function rejectValue(): void {
		rejectedAttempts += 1;
	}

	export function setExternalMonth(): void {
		month = monthPeriod(2027, 2);
	}
</script>

<ZProvider locale="en-US" timeZone="UTC">
	<form data-testid="period-form">
		<ZPeriodCalendar
			bind:focusedValue={focused}
			bind:value={month}
			data-testid="period-month"
			defaultValue={initialMonth}
			granularity="month"
			name="month"
			onFocusedValueChange={() => (focusChanges += 1)}
			onValueChange={() => (changes += 1)}
			required
		/>
		<ZPeriodCalendar
			bind:value={quarters}
			data-testid="period-quarter"
			defaultValue={[quarterPeriod(2026, 1, 4), quarterPeriod(2026, 3, 4)]}
			fiscalYearStartMonth={4}
			granularity="quarter"
			name="quarters"
			selectionMode="multiple"
		/>
		<ZPeriodCalendar
			bind:value={years}
			allowEmpty={false}
			data-testid="period-year-range"
			defaultFocusedValue={yearPeriod(2025)}
			defaultValue={{ end: null, start: yearPeriod(2025) }}
			granularity="year"
			name="years"
			required
			selectionMode="range"
		/>
		<ZPeriodCalendar
			bind:value={weeks}
			data-testid="period-week"
			defaultValue={[weekPeriod(2026, 10, { firstDayOfWeek: 'sun', minimalDaysInFirstWeek: 1 })]}
			granularity="week"
			name="weeks"
			selectionMode="multiple"
			showWeekNumbers
			weekRules={{ firstDayOfWeek: 'sun', minimalDaysInFirstWeek: 1 }}
		/>
		<ZPeriodCalendar
			bind:value={readRejected, rejectValue}
			data-testid="period-rejected"
			defaultValue={initialMonth}
			granularity="month"
		/>
		<ZPeriodCalendar
			data-testid="period-disabled"
			defaultValue={initialMonth}
			disabled
			granularity="month"
			name="disabled-period"
		/>
		<ZPeriodCalendar
			data-testid="period-readonly"
			defaultValue={initialMonth}
			granularity="month"
			name="readonly-period"
			readonly
		/>
		<ZPeriodCalendar
			data-testid="period-none"
			formParticipation="none"
			granularity="year"
			name="ignored"
			value={yearPeriod(2026)}
		/>
		<ZPeriodCalendar
			data-testid="period-year-boundary"
			defaultFocusedValue={yearPeriod(12)}
			formParticipation="none"
			granularity="year"
		/>
		<ZPeriodCalendar
			data-testid="period-auto-direction"
			defaultFocusedValue={monthPeriod(2026, 5)}
			dir="auto"
			formParticipation="none"
			granularity="month"
			style="direction: rtl"
		/>
		<button type="reset">Reset periods</button>
	</form>
</ZProvider>

<output data-testid="period-values"
	>{month ? `${month.year}-${month.month}` : 'null'}|{quarters
		.map((period) => `Q${period.quarter}`)
		.join(',')}|{years?.start?.year ?? 'null'}..{years?.end?.year ?? 'null'}|{weeks
		.map((period) => period.week)
		.join(',')}|{changes}:{focusChanges}|{rejected.year}-{rejected.month}:{rejectedAttempts}</output
>
