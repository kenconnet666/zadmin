<script lang="ts">
	import { CalendarDate, createCalendar } from '@internationalized/date';

	import ZProvider from '../src/components/gene/ZProvider.svelte';
	import ZDatePicker from '../src/components/input/ZDatePicker.svelte';
	import ZDateRangePicker from '../src/components/input/ZDateRangePicker.svelte';
	import type { CalendarRangeValue } from '../src/runtime/date.js';

	let japanese = $state<CalendarDate | null>(
		new CalendarDate(createCalendar('japanese'), 'reiwa', 8, 9, 7)
	);
	let hebrew = $state<CalendarDate | null>(new CalendarDate(createCalendar('hebrew'), 5784, 6, 15));
	let hebrewRange = $state<CalendarRangeValue | null>({
		start: new CalendarDate(createCalendar('hebrew'), 5784, 6, 15),
		end: new CalendarDate(createCalendar('hebrew'), 5784, 7, 15)
	});
	let lastRangePredicateCalendar = $state('none');
	let scheduledRangePredicateCalendar = 'none';

	export function clearHebrew(): void {
		hebrew = null;
	}

	export function clearHebrewRange(): void {
		hebrewRange = null;
		scheduledRangePredicateCalendar = 'none';
		lastRangePredicateCalendar = 'none';
	}

	function observeRangePredicate(candidate: CalendarDate): boolean {
		const calendar = candidate.calendar.identifier;
		if (scheduledRangePredicateCalendar !== calendar) {
			scheduledRangePredicateCalendar = calendar;
			queueMicrotask(() => (lastRangePredicateCalendar = calendar));
		}
		return false;
	}
</script>

<form data-testid="international-picker-form">
	<ZProvider locale="ja-JP-u-ca-japanese" timeZone="Asia/Tokyo">
		<ZDatePicker bind:value={japanese} data-testid="picker-japanese" name="japanese" />
	</ZProvider>
	<ZProvider locale="en-US-u-ca-hebrew" timeZone="Asia/Jerusalem">
		<ZDatePicker bind:value={hebrew} data-testid="picker-hebrew" name="hebrew" />
		<ZDateRangePicker
			bind:value={hebrewRange}
			data-testid="picker-hebrew-range"
			isDateUnavailable={observeRangePredicate}
			name="hebrew-range"
		/>
	</ZProvider>
</form>

<output data-testid="international-picker-output"
	>{japanese
		? `${japanese.calendar.identifier}:${japanese.era}:${japanese.year}-${japanese.month}-${japanese.day}`
		: 'null'}|{hebrew
		? `${hebrew.calendar.identifier}:${hebrew.era}:${hebrew.year}-${hebrew.month}-${hebrew.day}`
		: 'null'}|{hebrewRange?.start?.calendar.identifier ?? 'null'}:{hebrewRange?.start?.year ??
		'null'}..{hebrewRange?.end?.calendar.identifier ?? 'null'}:{hebrewRange?.end?.year ??
		'null'}</output
>
<output data-testid="international-picker-predicate">{lastRangePredicateCalendar}</output>
