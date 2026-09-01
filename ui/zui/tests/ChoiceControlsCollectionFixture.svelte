<script lang="ts">
	import {
		ZField,
		ZProvider,
		ZRadioGroup,
		ZSegmented,
		type SelectionKey,
		type ZRadioGroupOption,
		type ZSegmentedOption
	} from '../src/entrypoints/index.js';

	const radioComplete = [
		{ label: 'Numeric one', value: 1 },
		{ label: 'String one', value: '1' },
		{ disabled: true, label: 'Disabled radio', value: 'disabled' },
		{ label: 'Radio two', value: 2 }
	] satisfies readonly ZRadioGroupOption[];
	const segmentedComplete = [
		{ label: 'Numeric one', value: 1 },
		{ label: 'String one', value: '1' },
		{ disabled: true, label: 'Disabled segment', value: 'disabled' },
		{ label: 'Segment two', value: 2 }
	] satisfies readonly ZSegmentedOption[];

	let radioOptions = $state<readonly ZRadioGroupOption[]>(radioComplete);
	let radioValue = $state<SelectionKey | undefined>(1);
	let radioChanges = $state(0);
	let segmentedOptions = $state<readonly ZSegmentedOption[]>(segmentedComplete);
	let segmentedValue = $state<SelectionKey | undefined>(1);
	let segmentedChanges = $state(0);
	let segmentedNativeChanges = $state(0);
	const radioOutput = $derived(
		radioValue === undefined
			? 'undefined'
			: `${typeof radioValue}:${String(radioValue)}:${radioChanges}`
	);
	const segmentedOutput = $derived(
		segmentedValue === undefined
			? `undefined:${segmentedChanges}:${segmentedNativeChanges}`
			: `${typeof segmentedValue}:${String(segmentedValue)}:${segmentedChanges}:${segmentedNativeChanges}`
	);
</script>

<ZProvider direction="rtl">
	<ZField
		description="Typed external radio owner"
		error="Radio fixture error"
		label="Radio options"
		name="radio-choice"
		required
	>
		<ZRadioGroup
			bind:value={radioValue}
			data-testid="collection-radio-group"
			defaultValue={1}
			form="collection-radio-form"
			onValueChange={() => (radioChanges += 1)}
			options={radioOptions}
			orientation="horizontal"
		/>
	</ZField>
	<button
		data-testid="collection-radio-remove-string"
		type="button"
		onclick={() => (radioOptions = radioComplete.filter(({ value }) => value !== '1'))}
		>Remove string radio</button
	>
	<button
		data-testid="collection-radio-clear"
		type="button"
		onclick={() => (radioValue = undefined)}>Clear radio owner</button
	>
	<output data-testid="collection-radio-output">{radioOutput}</output>
	<form id="collection-radio-form" data-testid="collection-radio-form">
		<button data-testid="collection-radio-reset" type="reset">Reset radio</button>
	</form>

	<ZField
		description="Typed external segmented owner"
		error="Segmented fixture error"
		label="Segmented options"
		name="segment-choice"
		required
	>
		<ZSegmented
			bind:value={segmentedValue}
			data-testid="collection-segmented"
			defaultValue={1}
			form="collection-segmented-form"
			onchange={() => (segmentedNativeChanges += 1)}
			onValueChange={() => (segmentedChanges += 1)}
			options={segmentedOptions}
		/>
	</ZField>
	<button
		data-testid="collection-segmented-remove-string"
		type="button"
		onclick={() => (segmentedOptions = segmentedComplete.filter(({ value }) => value !== '1'))}
		>Remove string segment</button
	>
	<button
		data-testid="collection-segmented-clear"
		type="button"
		onclick={() => (segmentedValue = undefined)}>Clear segmented owner</button
	>
	<output data-testid="collection-segmented-output">{segmentedOutput}</output>
	<form id="collection-segmented-form" data-testid="collection-segmented-form">
		<button data-testid="collection-segmented-reset" type="reset">Reset segmented</button>
	</form>

	<form data-testid="collection-disabled-form">
		<ZRadioGroup
			aria-label="Disabled radio"
			disabled
			name="disabled-radio"
			options={radioComplete}
			value={1}
		/>
		<ZSegmented
			aria-label="Disabled segmented"
			disabled
			name="disabled-segmented"
			options={segmentedComplete}
			value={1}
		/>
	</form>
</ZProvider>
