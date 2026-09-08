<script lang="ts">
	import { Time } from '@internationalized/date';
	import ZButton from '../src/components/gene/ZButton.svelte';
	import ZField from '../src/components/input/ZField.svelte';
	import ZForm from '../src/components/input/ZForm.svelte';
	import ZFormField from '../src/components/input/ZFormField.svelte';
	import ZTimeField from '../src/components/input/ZTimeField.svelte';
	import { createFormModel } from '../src/runtime/form/form-model.svelte.js';

	const rejectedValue = new Time(9, 30, 15);
	const rejectedOwner = $state({ value: rejectedValue as Time | null });
	let rejectedWrites = $state(0);
	let rejectedChanges = $state(0);
	const rejectedModel = createFormModel({
		defaultValues: { value: rejectedValue as Time | null },
		read: () => rejectedOwner,
		write: () => {
			rejectedWrites += 1;
		}
	});
	const enabledDefault = new Time(9, 30, 15);
	let enabled = $state<Time | null>(enabledDefault);
	let enabledChanges = $state(0);
	let twelveHourChanges = $state(0);
	let imeChanges = $state(0);
	let imeHourChanges = $state(0);
</script>

<ZForm data-testid="time-rejected-form" model={rejectedModel}>
	<ZFormField label="拒绝时间" name="value">
		<ZTimeField
			aria-label="拒绝时间"
			data-testid="time-rejected"
			granularity="second"
			onValueChange={() => (rejectedChanges += 1)}
		/>
	</ZFormField>
</ZForm>

<form data-testid="time-ownership-form">
	<ZField label="可提交时间">
		<ZTimeField
			aria-label="可提交时间"
			bind:value={enabled}
			data-testid="time-enabled"
			defaultValue={enabledDefault}
			granularity="second"
			name="enabled"
			onValueChange={() => (enabledChanges += 1)}
		/>
	</ZField>
	<ZField label="只读时间">
		<ZTimeField
			aria-label="只读时间"
			data-testid="time-readonly"
			defaultValue={new Time(10, 0)}
			name="readonly"
			readonly
		/>
	</ZField>
	<ZField label="禁用时间">
		<ZTimeField
			aria-label="禁用时间"
			data-testid="time-disabled"
			defaultValue={new Time(11, 0)}
			disabled
			name="disabled"
		/>
	</ZField>
	<ZField label="无表单参与时间">
		<ZTimeField
			aria-label="无表单参与时间"
			data-testid="time-none"
			defaultValue={new Time(12, 0)}
			formParticipation="none"
			name="none"
		/>
	</ZField>
	<ZButton type="reset" variant="outline">Reset</ZButton>
</form>
<output data-testid="time-rejected-counters"
	>writes={rejectedWrites}; changes={rejectedChanges}</output
>
<output data-testid="time-enabled-counters">changes={enabledChanges}</output>

<form data-testid="time-boundary-form">
	<ZField label="12 hour time">
		<ZTimeField
			aria-label="12 hour time"
			data-testid="time-us-12"
			defaultValue={new Time(13, 5, 7)}
			granularity="second"
			hourCycle={12}
			locale="en-US"
			name="twelveHour"
			onValueChange={() => (twelveHourChanges += 1)}
		/>
	</ZField>
	<ZField label="RTL time">
		<ZTimeField
			aria-label="RTL time"
			data-testid="time-rtl"
			defaultValue={new Time(9, 30)}
			dir="rtl"
			hourCycle={24}
			locale="en-US"
			name="rtl"
		/>
	</ZField>
	<ZField label="Constrained time">
		<ZTimeField
			aria-label="Constrained time"
			data-testid="time-constrained"
			defaultValue={new Time(9, 30)}
			locale="en-US"
			maxValue={new Time(9, 45)}
			minValue={new Time(9, 30)}
			name="constrained"
		/>
	</ZField>
	<ZField label="Composed time">
		<ZTimeField
			aria-label="Composed time"
			data-testid="time-ime"
			defaultValue={new Time(9, 30)}
			locale="en-US"
			name="ime"
			onValueChange={() => (imeChanges += 1)}
		/>
	</ZField>
	<ZField label="Composed hour">
		<ZTimeField
			aria-label="Composed hour"
			data-testid="time-ime-hour"
			defaultValue={new Time(9)}
			granularity="hour"
			locale="en-US"
			name="imeHour"
			onValueChange={() => (imeHourChanges += 1)}
		/>
	</ZField>
	<button data-testid="time-ime-external" type="button">External focus</button>
</form>
<output data-testid="time-boundary-counters">twelve={twelveHourChanges}; ime={imeChanges}</output>
<output data-testid="time-ime-hour-counters">changes={imeHourChanges}</output>
