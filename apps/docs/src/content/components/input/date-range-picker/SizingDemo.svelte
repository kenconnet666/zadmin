<script lang="ts">
	import { ZStack, ZField, ZDateRangePicker } from '@zadmin/zui';
	import { CalendarDate } from '@internationalized/date';
	const sizes = ['xsmall', 'small', 'medium', 'large', 'xlarge'] as const;
</script>

<ZStack gap="large" align="start">
	{#each sizes as size (size)}
		<ZField label={`date-range-picker ${size}`} {size}>
			<ZDateRangePicker
				defaultValue={{ start: new CalendarDate(2026, 9, 6), end: new CalendarDate(2026, 9, 9) }}
			/>
		</ZField>
	{/each}
</ZStack>
