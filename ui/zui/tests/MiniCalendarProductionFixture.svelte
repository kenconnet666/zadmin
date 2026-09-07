<script lang="ts">
	import { CalendarDate } from '@internationalized/date';

	import ZProvider from '../src/components/gene/ZProvider.svelte';
	import ZField from '../src/components/input/ZField.svelte';
	import ZMiniCalendar from '../src/components/input/ZMiniCalendar.svelte';
	import type {
		CalendarCellContext,
		CalendarHeaderContext
	} from '../src/components/input/ZCalendar.svelte';

	const initial = new CalendarDate(2026, 9, 15);
	let value = $state<CalendarDate | null>(initial);
	let focused = $state<CalendarDate>(initial);
	let changes = $state(0);
	let focusChanges = $state(0);
	let calendarRef = $state<HTMLDivElement | null>(null);

	export function setExternal(): void {
		const next = new CalendarDate(2026, 10, 2);
		value = next;
		focused = next;
	}
</script>

{#snippet dateCell(context: CalendarCellContext)}
	<span data-mini-calendar-date={context.date.toString()}>{context.date.day}</span>
{/snippet}

{#snippet header(context: CalendarHeaderContext)}
	<button
		type="button"
		aria-label="Previous custom dates"
		disabled={context.previousDisabled}
		onclick={context.goToPreviousPage}>Previous</button
	>
	<strong data-mini-calendar-header>{context.label}</strong>
	<button
		type="button"
		aria-label="Next custom dates"
		disabled={context.nextDisabled}
		onclick={context.goToNextPage}>Next</button
	>
{/snippet}

<form data-testid="mini-calendar-form">
	<ZMiniCalendar
		bind:focusedValue={focused}
		bind:ref={calendarRef}
		bind:value
		calendarLabel="Delivery dates"
		data-testid="mini-calendar"
		defaultFocusedValue={initial}
		defaultValue={initial}
		isDateUnavailable={(date) => date.day === 16}
		locale="en-US"
		maxValue={new CalendarDate(2026, 10, 20)}
		minValue={new CalendarDate(2026, 9, 10)}
		name="delivery"
		nextLabel="Next dates"
		onFocusedValueChange={() => (focusChanges += 1)}
		onValueChange={() => (changes += 1)}
		previousLabel="Previous dates"
		required
		size="large"
		timeZone="UTC"
		visibleDays={5}
	/>
	<button type="reset">Reset mini calendar</button>
</form>

<ZMiniCalendar
	calendarLabel="Readonly dates"
	data-testid="mini-calendar-readonly"
	defaultFocusedValue={initial}
	defaultValue={initial}
	locale="en-US"
	readonly
	timeZone="UTC"
/>
<ZMiniCalendar
	calendarLabel="Disabled dates"
	data-testid="mini-calendar-disabled"
	defaultValue={initial}
	disabled
	locale="en-US"
	name="disabled-date"
	timeZone="UTC"
/>
<ZMiniCalendar
	calendarLabel="Auxiliary dates"
	data-testid="mini-calendar-none"
	{dateCell}
	defaultValue={initial}
	formParticipation="none"
	{header}
	locale="en-US"
	name="ignored-date"
	timeZone="UTC"
	visibleDays={10}
/>

<ZProvider componentDefaults={{ calendar: { size: 'small' }, miniCalendar: { size: 'xlarge' } }}>
	<ZMiniCalendar
		calendarLabel="Provider-sized dates"
		data-testid="mini-calendar-provider-size"
		defaultValue={initial}
	/>
	<ZField label="Field-sized dates" size="large">
		<ZMiniCalendar data-testid="mini-calendar-field-size" defaultValue={initial} />
	</ZField>
</ZProvider>

<output data-testid="mini-calendar-output"
	>{value?.toString() ?? 'null'}|{focused?.toString() ??
		'none'}|{changes}|{focusChanges}|{calendarRef?.dataset.testid === 'mini-calendar'}</output
>
