<script lang="ts">
	import { CalendarDate, createCalendar } from '@internationalized/date';

	import ZCalendar, { type CalendarCellContext } from '../src/components/input/ZCalendar.svelte';
	import ZMiniCalendar from '../src/components/input/ZMiniCalendar.svelte';

	const gregorianInitial = new CalendarDate(2024, 4, 8);
	const hebrewInitial = new CalendarDate(createCalendar('hebrew'), 5784, 13, 29);
	const japaneseInitial = new CalendarDate(createCalendar('japanese'), 'heisei', 31, 4, 30);
	const stripInitial = new CalendarDate(2026, 3, 21);
	let displayLocale = $state('he-IL-u-ca-hebrew');
	let gregorian = $state<CalendarDate | null>(gregorianInitial);
	let hebrew = $state<CalendarDate | null>(hebrewInitial);
	let japanese = $state<CalendarDate | null>(japaneseInitial);
	let strip = $state<CalendarDate | null>(stripInitial);
	let mini = $state<CalendarDate | null>(stripInitial);
	let gregorianChanges = $state(0);
	let hebrewChanges = $state(0);
	let japaneseChanges = $state(0);
	let miniChanges = $state(0);

	function owner(value: CalendarDate | null): string {
		return value
			? `${value.calendar.identifier}:${value.era}:${value.year}-${value.month}-${value.day}`
			: 'null';
	}

	export function showPersian(): void {
		displayLocale = 'fa-IR-u-ca-persian';
	}
</script>

{#snippet dateCell(context: CalendarCellContext)}
	<span
		data-context-calendar={context.date.calendar.identifier}
		data-context-day={context.date.day}
		data-context-era={context.date.era}
		data-context-month={context.date.month}
		data-context-year={context.date.year}
	>
		{context.date.day}
	</span>
{/snippet}

<form data-testid="international-calendar-form">
	<ZCalendar
		bind:value={gregorian}
		calendarLabel="Gregorian owner with locale display calendar"
		data-testid="calendar-locale-switch"
		defaultFocusedValue={gregorianInitial}
		{dateCell}
		locale={displayLocale}
		name="gregorian"
		onValueChange={() => (gregorianChanges += 1)}
		timeZone="UTC"
	/>
	<ZCalendar
		bind:value={hebrew}
		calendarLabel="Hebrew leap month calendar"
		data-testid="calendar-hebrew-owner"
		defaultFocusedValue={hebrewInitial}
		{dateCell}
		locale="he-IL-u-ca-hebrew"
		name="hebrew"
		onValueChange={() => (hebrewChanges += 1)}
		timeZone="UTC"
	/>
	<ZCalendar
		bind:value={japanese}
		calendarLabel="Japanese era calendar"
		data-testid="calendar-japanese-owner"
		defaultFocusedValue={japaneseInitial}
		{dateCell}
		locale="ja-JP-u-ca-japanese"
		name="japanese"
		onValueChange={() => (japaneseChanges += 1)}
		timeZone="UTC"
	/>
	<ZCalendar
		bind:value={strip}
		calendarLabel="Persian strip calendar"
		data-testid="calendar-persian-strip"
		defaultFocusedValue={stripInitial}
		{dateCell}
		locale="fa-IR-u-ca-persian"
		name="strip"
		timeZone="UTC"
		view="strip"
		visibleDays={7}
	/>
	<ZMiniCalendar
		bind:value={mini}
		calendarLabel="Persian mini calendar"
		data-testid="calendar-persian-mini"
		defaultFocusedValue={stripInitial}
		{dateCell}
		locale="fa-IR-u-ca-persian"
		name="mini"
		onValueChange={() => (miniChanges += 1)}
		timeZone="UTC"
		visibleDays={7}
	/>
</form>

<output data-testid="calendar-locale-switch-output">{owner(gregorian)}|{gregorianChanges}</output>
<output data-testid="calendar-hebrew-output">{owner(hebrew)}|{hebrewChanges}</output>
<output data-testid="calendar-japanese-output">{owner(japanese)}|{japaneseChanges}</output>
<output data-testid="calendar-strip-output">{owner(strip)}</output>
<output data-testid="calendar-mini-output">{owner(mini)}|{miniChanges}</output>
