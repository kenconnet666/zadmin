<script lang="ts">
	import { CalendarDate } from '@internationalized/date';
	import ZDatePicker from '../src/components/input/ZDatePicker.svelte';
	import ZDateRangePicker from '../src/components/input/ZDateRangePicker.svelte';
	import ZProvider from '../src/components/gene/ZProvider.svelte';
	let { kind }: { kind: 'date' | 'range' } = $props();
	let disabled = $state(true);
	let readonly = $state(false);
	let open = $state(true);
	let changes = $state(0);
	const date = new CalendarDate(2026, 9, 7);
	export const enable = () => {
		disabled = false;
	};
	export const makeReadonly = () => {
		readonly = true;
	};
	export const intent = () => ({ open, changes });
</script>

<ZProvider direction="rtl">
	{#if kind === 'date'}
		<ZDatePicker
			data-testid="state-picker"
			dir="ltr"
			{disabled}
			{readonly}
			bind:open
			defaultValue={date}
			onOpenChange={() => {
				changes += 1;
			}}
		/>
	{:else}
		<ZDateRangePicker
			data-testid="state-picker"
			dir="ltr"
			{disabled}
			{readonly}
			bind:open
			defaultValue={{ start: date, end: date.add({ days: 1 }) }}
			onOpenChange={() => {
				changes += 1;
			}}
		/>
	{/if}
</ZProvider>
