<script lang="ts">
	import { CalendarDate, Time } from '@internationalized/date';
	import ZField from '../src/components/input/ZField.svelte';
	import ZInputGroup from '../src/components/input/ZInputGroup.svelte';
	import ZDateField from '../src/components/input/ZDateField.svelte';
	import ZTimeField from '../src/components/input/ZTimeField.svelte';
	let disabled = $state(false);
	export function disable(): void {
		disabled = true;
	}
</script>

<form data-testid="date-input-groups">
	<ZField name="date" label="Grouped date" description="Grouped date description">
		<ZInputGroup {disabled} size="large" data-testid="date-group">
			<ZDateField
				appearance="bare"
				defaultValue={new CalendarDate(2026, 9, 7)}
				data-testid="date-control"
			/>
		</ZInputGroup>
	</ZField>
	<ZField name="time" label="Grouped time">
		<ZInputGroup {disabled} size="large" data-testid="time-group">
			<ZTimeField
				appearance="bare"
				defaultValue={new Time(9, 30)}
				hourCycle={12}
				data-testid="time-control"
			/>
		</ZInputGroup>
	</ZField>
</form>
