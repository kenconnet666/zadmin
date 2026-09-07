<script lang="ts">
	import { CalendarDateTime, toZoned, type ZonedDateTime } from '@internationalized/date';
	import ZProvider from '../src/components/gene/ZProvider.svelte';
	import DateTimePickerPanel from '../src/components/input/DateTimePickerPanel.svelte';

	const initial = new CalendarDateTime(2026, 9, 7, 9, 30, 15, 125);
	let value = $state<CalendarDateTime>(initial);
	let committed = $state<CalendarDateTime>(initial);
	let changes = $state(0);
	let confirms = $state(0);
	let cancels = $state(0);
	let lazyCalls = $state(0);
	const dstInitial = toZoned(new CalendarDateTime(2026, 3, 7, 2, 30), 'America/New_York');
	let dstValue = $state<ZonedDateTime>(dstInitial);
	let dstDraftValid = $state(true);

	function update(next: CalendarDateTime | ZonedDateTime): void {
		if (!(next instanceof CalendarDateTime)) return;
		value = next;
		changes += 1;
	}

	function confirm(next: CalendarDateTime | ZonedDateTime): void {
		if (!(next instanceof CalendarDateTime)) return;
		committed = next;
		confirms += 1;
	}

	function cancel(): void {
		value = committed;
		cancels += 1;
	}

	function lazyPreset(): CalendarDateTime {
		lazyCalls += 1;
		return new CalendarDateTime(2026, 9, 9, 14, 45, 30, lazyCalls);
	}
</script>

<ZProvider locale="en-US" timeZone="America/New_York">
	<div data-testid="date-time-panel-local">
		<DateTimePickerPanel
			calendarLabel="Choose local date and time"
			cancelLabel="Cancel"
			confirmLabel="Confirm"
			direction="ltr"
			disabled={false}
			disambiguation="compatible"
			granularity="second"
			hourCycle={24}
			idBase="local-date-time"
			invalidDateTimeLabel="Unavailable date and time"
			isDateTimeUnavailable={(candidate) => candidate.day === 7 && candidate.hour === 9}
			locale="en-US"
			minuteStep={1}
			mode="local"
			nextLabel="Next month"
			noAvailableTimeLabel="No available time"
			nowLabel="Now"
			onCancel={cancel}
			onConfirm={confirm}
			onControllerChange={() => undefined}
			onValueChange={update}
			placeholderValue={initial}
			presets={[
				{ label: 'Static date time', value: new CalendarDateTime(2026, 9, 8, 12) },
				{ label: 'Lazy date time', value: lazyPreset }
			]}
			previousLabel="Previous month"
			secondStep={1}
			showNow
			size="medium"
			timeZone="America/New_York"
			toggleDayPeriodLabel="Toggle day period"
			{value}
		/>
	</div>
	<div data-testid="date-time-panel-dst">
		<DateTimePickerPanel
			calendarLabel="Choose zoned date and time"
			confirmLabel="Confirm"
			direction="ltr"
			disabled={false}
			disambiguation="reject"
			granularity="minute"
			hourCycle={24}
			idBase="dst-date-time"
			onDraftChange={(next) => (dstDraftValid = next.valid)}
			invalidDateTimeLabel="Nonexistent wall time"
			locale="en-US"
			minuteStep={1}
			mode="zoned"
			nextLabel="Next month"
			noAvailableTimeLabel="No available time"
			nowLabel="Now"
			onConfirm={() => undefined}
			onControllerChange={() => undefined}
			onValueChange={(next) => {
				if (next instanceof CalendarDateTime) return;
				dstValue = next;
			}}
			placeholderValue={dstInitial}
			previousLabel="Previous month"
			secondStep={1}
			size="medium"
			timeZone="America/New_York"
			toggleDayPeriodLabel="Toggle day period"
			value={dstValue}
		/>
	</div>
</ZProvider>

<output data-testid="date-time-panel-values"
	>{value.toString()}|{committed.toString()}|{changes}:{confirms}:{cancels}:{lazyCalls}</output
>
<output data-testid="date-time-panel-dst-value">{dstValue.toString()}</output>
<output data-testid="date-time-panel-dst-valid">{String(dstDraftValid)}</output>
