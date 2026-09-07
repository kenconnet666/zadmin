<script lang="ts">
	import { CalendarDate } from '@internationalized/date';
	import ZCalendar from '../src/components/input/ZCalendar.svelte';
	let { kind = 'multiple' }: { kind?: 'multiple' | 'range' } = $props();
</script>

{#if kind === 'multiple'}
	<ZCalendar
		selectionMode="multiple"
		defaultFocusedValue={new CalendarDate(2026, 9, 15)}
		defaultValue={[new CalendarDate(2026, 9, 10), new CalendarDate(2026, 9, 5)]}
		name="days"
		showWeekNumbers
		visibleMonths={2}
	/>
{:else}
	<ZCalendar
		selectionMode="range"
		defaultValue={{ start: new CalendarDate(2026, 9, 7), end: null }}
		name="window"
	/>
{/if}
