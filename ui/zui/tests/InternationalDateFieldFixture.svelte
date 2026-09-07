<script lang="ts">
	import { CalendarDate, createCalendar } from '@internationalized/date';

	import ZProvider from '../src/components/gene/ZProvider.svelte';
	import ZDateField, { type DateSegment } from '../src/components/input/ZDateField.svelte';

	let japanese = $state<CalendarDate | null>(
		new CalendarDate(createCalendar('japanese'), 'reiwa', 8, 9, 7)
	);
	let hebrew = $state<CalendarDate | null>(new CalendarDate(createCalendar('hebrew'), 5784, 6, 15));
	let persian = $state<CalendarDate | null>(
		new CalendarDate(createCalendar('persian'), 1403, 1, 1)
	);
	let gregorian = $state<CalendarDate | null>(new CalendarDate(8, 9, 7));
	let japaneseChanges = $state(0);
	let hebrewChanges = $state(0);
	let persianChanges = $state(0);
	let gregorianChanges = $state(0);

	function label(owner: string, segment: DateSegment): string {
		return `${owner} ${segment}`;
	}

	export function clearPersian(): void {
		persian = null;
	}
</script>

<form data-testid="international-date-form">
	<ZProvider locale="ja-JP-u-ca-japanese" timeZone="Asia/Tokyo">
		<ZDateField
			bind:value={japanese}
			data-testid="date-field-japanese"
			name="japanese"
			onValueChange={() => (japaneseChanges += 1)}
			segmentLabel={(segment) => label('Japanese', segment)}
		/>
	</ZProvider>
	<ZProvider locale="en-US-u-ca-hebrew" timeZone="Asia/Jerusalem">
		<ZDateField
			bind:value={hebrew}
			data-testid="date-field-hebrew"
			name="hebrew"
			onValueChange={() => (hebrewChanges += 1)}
			segmentLabel={(segment) => label('Hebrew', segment)}
		/>
	</ZProvider>
	<ZProvider locale="fa-IR-u-ca-persian" timeZone="Asia/Tehran">
		<ZDateField
			bind:value={persian}
			data-testid="date-field-persian"
			name="persian"
			onValueChange={() => (persianChanges += 1)}
			segmentLabel={(segment) => label('Persian', segment)}
		/>
	</ZProvider>
	<ZProvider locale="en-US-u-ca-gregory" timeZone="UTC">
		<ZDateField
			bind:value={gregorian}
			data-testid="date-field-gregorian"
			name="gregorian"
			onValueChange={() => (gregorianChanges += 1)}
			segmentLabel={(segment) => label('Gregorian', segment)}
		/>
	</ZProvider>
</form>

<output data-testid="international-date-output"
	>{japanese
		? `${japanese.calendar.identifier}:${japanese.era}:${japanese.year}-${japanese.month}-${japanese.day}`
		: 'null'}|{hebrew
		? `${hebrew.calendar.identifier}:${hebrew.era}:${hebrew.year}-${hebrew.month}-${hebrew.day}`
		: 'null'}|{persian
		? `${persian.calendar.identifier}:${persian.era}:${persian.year}-${persian.month}-${persian.day}`
		: 'null'}|{gregorian
		? `${gregorian.calendar.identifier}:${gregorian.era}:${gregorian.year}-${gregorian.month}-${gregorian.day}`
		: 'null'}|{japaneseChanges}:{hebrewChanges}:{persianChanges}:{gregorianChanges}</output
>
