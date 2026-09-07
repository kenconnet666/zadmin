<script lang="ts">
	import {
		CalendarDateTime,
		createCalendar,
		parseZonedDateTime,
		toCalendar,
		type ZonedDateTime
	} from '@internationalized/date';
	import ZProvider from '../src/components/gene/ZProvider.svelte';
	import ZDateTimePicker from '../src/components/input/ZDateTimePicker.svelte';
	import ZDateTimeRangePicker from '../src/components/input/ZDateTimeRangePicker.svelte';
	import type { DateTimeRangeValue } from '../src/runtime/date-time-range.js';

	const hebrewCalendar = createCalendar('hebrew');
	const persianCalendar = createCalendar('persian');
	const localBase = new CalendarDateTime(2026, 9, 7, 9, 30);
	const hebrewLocal = toCalendar(localBase, hebrewCalendar);
	let localValue = $state<CalendarDateTime | null>(hebrewLocal);
	let localCommitCalendar = $state('none');

	const gregorianZoned = parseZonedDateTime('2026-09-07T09:30-04:00[America/New_York]');
	const hebrewZoned = toCalendar(gregorianZoned, hebrewCalendar);
	let zonedValue = $state<ZonedDateTime | null>(gregorianZoned);

	const rangeStart = toCalendar(localBase, hebrewCalendar);
	const rangeEnd = toCalendar(localBase.add({ hours: 8 }), persianCalendar);
	let rangeValue = $state({ start: rangeStart, end: rangeEnd });
	let rangeCommitCalendars = $state('none');
	const gregorianPreset = {
		label: 'Owner range',
		value: {
			start: localBase.add({ days: 1 }),
			end: localBase.add({ days: 1, hours: 8 })
		}
	};
</script>

<ZProvider locale="en-US" timeZone="America/New_York">
	<div data-testid="owner-local">
		<ZDateTimePicker
			commitMode="immediate"
			onCommit={(next: CalendarDateTime | null) =>
				(localCommitCalendar = next?.calendar.identifier ?? 'none')}
			onValueChange={(next: CalendarDateTime | null) => (localValue = next)}
			presentation="inline"
			showNow
			value={localValue}
		/>
	</div>

	<div data-testid="owner-zoned">
		<button
			type="button"
			data-testid="switch-zoned-calendar"
			onclick={() => (zonedValue = hebrewZoned)}
		>
			Switch calendar
		</button>
		<ZDateTimePicker
			commitMode="immediate"
			mode="zoned"
			onValueChange={(next: ZonedDateTime | null) => (zonedValue = next)}
			presentation="inline"
			showNow
			value={zonedValue}
		/>
	</div>

	<div data-testid="owner-range">
		<ZDateTimeRangePicker
			commitMode="immediate"
			onCommit={(next: DateTimeRangeValue<'local'> | null) =>
				(rangeCommitCalendars = next
					? `${next.start?.calendar.identifier}:${next.end?.calendar.identifier}`
					: 'none')}
			onValueChange={(next: DateTimeRangeValue<'local'> | null) => {
				if (next?.start && next.end) rangeValue = { start: next.start, end: next.end };
			}}
			presentation="inline"
			presets={[gregorianPreset]}
			value={rangeValue}
		/>
	</div>
</ZProvider>

<output data-testid="owner-local-output"
	>{localValue?.calendar.identifier ?? 'null'}:{localCommitCalendar}</output
>
<output data-testid="owner-zoned-output"
	>{zonedValue ? `${zonedValue.calendar.identifier}:${zonedValue.timeZone}` : 'null'}</output
>
<output data-testid="owner-range-output"
	>{rangeValue.start.calendar.identifier}:{rangeValue.end.calendar
		.identifier}:{rangeCommitCalendars}</output
>
