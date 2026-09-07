<script lang="ts">
	import { CalendarDate, createCalendar } from '@internationalized/date';
	import ZCalendar from '../src/components/input/ZCalendar.svelte';
	let value = $state<CalendarDate | null>(new CalendarDate(2026, 9, 15));
	let eraFocus = $state<CalendarDate>();
</script>

<ZCalendar
	data-testid="closed-month"
	bind:value
	locale="en-US"
	isDateUnavailable={(date) => date.month === 10}
/>
<ZCalendar
	data-testid="era-month"
	bind:focusedValue={eraFocus}
	defaultFocusedValue={new CalendarDate(createCalendar('japanese'), 'meiji', 45, 6, 30)}
	locale="ja-JP-u-ca-japanese"
/>
<output data-testid="closed-value">{value?.toString()}</output>
<output data-testid="era-focus"
	>{eraFocus
		? `${eraFocus.era}:${eraFocus.year}-${eraFocus.month}-${eraFocus.day}`
		: 'none'}</output
>
