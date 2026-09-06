<script lang="ts">
	import { ZStack, ZField, ZDateField } from '@zadmin/zui';
	import { CalendarDate } from '@internationalized/date';
	const sizes = ['xsmall', 'small', 'medium', 'large', 'xlarge'] as const;
</script>

<ZStack gap="large" align="start">
	{#each sizes as size (size)}
		<ZField label={`date-field ${size}`} {size}>
			<ZDateField defaultValue={new CalendarDate(2026, 9, 6)} />
		</ZField>
	{/each}
</ZStack>
