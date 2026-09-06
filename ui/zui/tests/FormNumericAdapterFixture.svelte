<script lang="ts">
	import ZForm, { type ZFormController } from '../src/components/input/ZForm.svelte';
	import ZFormField from '../src/components/input/ZFormField.svelte';
	import ZSlider from '../src/components/input/ZSlider.svelte';
	import ZRangeSlider from '../src/components/input/ZRangeSlider.svelte';
	import ZRating from '../src/components/input/ZRating.svelte';
	import { createFormModel, type FormValuesChange } from '../src/runtime/form/form-model.svelte.js';
	import type { SliderRangeValue } from '../src/runtime/slider.js';

	interface Values {
		slider: number;
		range: SliderRangeValue;
		rating: number | null | undefined;
	}
	const defaults: Values = { slider: 35, range: [20, 80], rating: 2.5 };
	let owner = $state<Values>({ ...defaults });
	let changes = $state<readonly FormValuesChange<Values>[]>([]);
	let controlChanges = $state(0);
	let controller = $state<ZFormController<Values, Values> | null>(null);
	const model = createFormModel({
		defaultValues: defaults,
		read: () => owner,
		write: (next) => (owner = { ...next }),
		onValuesChange: (detail) => (changes = [...changes, detail])
	});
	const rejectedOwner = $state({ slider: 40, range: [25, 75] as SliderRangeValue, rating: 3 });
	const rejected = createFormModel({
		defaultValues: rejectedOwner,
		read: () => rejectedOwner,
		write: () => undefined
	});
	export function updateController(): void {
		controller?.setFieldValue('slider', 70);
		controller?.setFieldValue('range', [30, 60]);
		controller?.setFieldValue('rating', null);
	}
</script>

<ZForm bind:controller {model} data-testid="numeric-form">
	<ZFormField name="slider" label="Slider"
		><ZSlider
			data-testid="numeric-slider"
			onValueChange={() => (controlChanges += 1)}
		/></ZFormField
	>
	<ZFormField name="range" label="Range"
		><ZRangeSlider
			data-testid="numeric-range"
			thumbLabels={['Low', 'High']}
			onValueChange={() => (controlChanges += 1)}
		/></ZFormField
	>
	<ZFormField name="rating" label="Rating"
		><ZRating
			data-testid="numeric-rating"
			fractions={2}
			onValueChange={() => (controlChanges += 1)}
		/></ZFormField
	>
	<button type="reset">Reset numeric</button>
</ZForm>
<output data-testid="numeric-values"
	>{owner.slider}|{owner.range.join(',')}|{String(
		owner.rating
	)}|{changes.length}|{controlChanges}</output
>

<ZForm model={rejected} data-testid="numeric-rejected-form">
	<ZFormField name="slider" label="Rejected slider"
		><ZSlider data-testid="rejected-slider" /></ZFormField
	>
	<ZFormField name="range" label="Rejected range"
		><ZRangeSlider data-testid="rejected-range" thumbLabels={['Low', 'High']} /></ZFormField
	>
	<ZFormField name="rating" label="Rejected rating"
		><ZRating data-testid="rejected-rating" /></ZFormField
	>
	<button type="reset">Reset rejected</button>
</ZForm>
