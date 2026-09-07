<script lang="ts">
	import { CalendarDateTime, type ZonedDateTime } from '@internationalized/date';
	import ZProvider from '../src/components/gene/ZProvider.svelte';
	import DateTimePickerPanel from '../src/components/input/DateTimePickerPanel.svelte';

	const boundaryPlaceholder = new CalendarDateTime(2026, 9, 7, 9);
	let boundaryValue = $state<CalendarDateTime | null>(null);
	let boundaryChanges = $state(0);
	const readonlyInitial = new CalendarDateTime(2026, 9, 7, 10, 30, 15, 125);
	let readonlyValue = $state(readonlyInitial);
	let readonlyChanges = $state(0);
	let readonlyConfirms = $state(0);
	const controlledInitial = new CalendarDateTime(2026, 9, 7, 12);
	let controlledAttempts = $state(0);
	let lazyCalls = $state(0);

	function acceptBoundary(next: CalendarDateTime | ZonedDateTime): void {
		if (!(next instanceof CalendarDateTime)) return;
		boundaryValue = next;
		boundaryChanges += 1;
	}

	function rejectControlled(): void {
		controlledAttempts += 1;
	}

	function lazyRejectedPreset(): CalendarDateTime {
		lazyCalls += 1;
		return new CalendarDateTime(2026, 9, 9, 14, 45, 30, lazyCalls);
	}
</script>

<ZProvider locale="en-US" timeZone="America/New_York">
	<div data-testid="joint-boundary-panel">
		<DateTimePickerPanel
			calendarLabel="Boundary date and time"
			confirmLabel="Confirm"
			direction="ltr"
			disabled={false}
			disambiguation="compatible"
			granularity="hour"
			hourCycle={24}
			idBase="joint-boundary"
			invalidDateTimeLabel="Unavailable date and time"
			locale="en-US"
			maxValue={new CalendarDateTime(2026, 9, 7, 10, 45, 15, 250)}
			minValue={new CalendarDateTime(2026, 9, 7, 10, 30, 15, 125)}
			minuteStep={1}
			mode="local"
			nextLabel="Next month"
			noAvailableTimeLabel="No available time"
			nowLabel="Now"
			onConfirm={acceptBoundary}
			onControllerChange={() => undefined}
			onValueChange={acceptBoundary}
			placeholderValue={boundaryPlaceholder}
			previousLabel="Previous month"
			secondStep={1}
			size="medium"
			timeZone="America/New_York"
			toggleDayPeriodLabel="Toggle day period"
			value={boundaryValue}
		/>
	</div>

	<div data-testid="joint-readonly-panel">
		<DateTimePickerPanel
			calendarLabel="Readonly date and time"
			confirmLabel="Confirm"
			direction="ltr"
			disabled={false}
			disambiguation="compatible"
			granularity="second"
			hourCycle={24}
			idBase="joint-readonly"
			invalidDateTimeLabel="Unavailable date and time"
			locale="en-US"
			minuteStep={1}
			mode="local"
			nextLabel="Next month"
			noAvailableTimeLabel="No available time"
			nowLabel="Now"
			onConfirm={() => (readonlyConfirms += 1)}
			onControllerChange={() => undefined}
			onValueChange={(next) => {
				if (!(next instanceof CalendarDateTime)) return;
				readonlyValue = next;
				readonlyChanges += 1;
			}}
			placeholderValue={readonlyInitial}
			presets={[{ label: 'Readonly preset', value: new CalendarDateTime(2026, 9, 8, 11) }]}
			previousLabel="Previous month"
			readonly
			secondStep={1}
			showNow
			size="medium"
			timeZone="America/New_York"
			toggleDayPeriodLabel="Toggle day period"
			value={readonlyValue}
		/>
	</div>

	<div data-testid="joint-controlled-panel">
		<DateTimePickerPanel
			calendarLabel="Controlled date and time"
			confirmLabel="Confirm"
			direction="ltr"
			disabled={false}
			disambiguation="compatible"
			granularity="minute"
			hourCycle={24}
			idBase="joint-controlled"
			invalidDateTimeLabel="Unavailable date and time"
			locale="en-US"
			minuteStep={1}
			mode="local"
			nextLabel="Next month"
			noAvailableTimeLabel="No available time"
			nowLabel="Now"
			onConfirm={() => undefined}
			onControllerChange={() => undefined}
			onValueChange={rejectControlled}
			placeholderValue={controlledInitial}
			presets={[{ label: 'Rejected preset', value: lazyRejectedPreset }]}
			previousLabel="Previous month"
			secondStep={1}
			size="medium"
			timeZone="America/New_York"
			toggleDayPeriodLabel="Toggle day period"
			value={controlledInitial}
		/>
	</div>
</ZProvider>

<output data-testid="joint-boundary-output"
	>{boundaryValue?.toString() ?? 'null'}|{boundaryChanges}</output
>
<output data-testid="joint-readonly-output"
	>{readonlyValue.toString()}|{readonlyChanges}:{readonlyConfirms}</output
>
<output data-testid="joint-controlled-output">{controlledAttempts}:{lazyCalls}</output>
