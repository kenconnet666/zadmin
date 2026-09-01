<script lang="ts">
	import {
		ZCheckbox,
		ZField,
		ZProvider,
		ZRadioGroup,
		ZRadioGroupItem,
		ZSegmented,
		ZSlider
	} from '../src/entrypoints/index.js';

	let checkbox = $state(true);
	let slider = $state(35);
	let radio = $state('b');
	let segmented = $state<string | number>('b');
	let checkboxChanges = $state(0);
	let checkboxClicks = $state(0);
	let checkboxNativeChanges = $state(0);
	let sliderChanges = $state(0);
	let sliderInputs = $state(0);
	let sliderNativeChanges = $state(0);
	let sliderKeys = $state(0);
	let sliderPointers = $state(0);
	let radioChanges = $state(0);
	let radioClicks = $state(0);
	let radioNativeChanges = $state(0);
	let radioKeys = $state(0);
	let segmentedChanges = $state(0);
	let segmentedNativeChanges = $state(0);

	let boundaryCheckbox = $state(false);
	let boundarySlider = $state(10);
	let boundaryRadio = $state('a');
	let boundarySegmented = $state<string | number>('a');

	const items = [
		{ label: 'Alpha', value: 'a' },
		{ label: 'Beta', value: 'b' },
		{ disabled: true, label: 'Charlie', value: 'c' },
		{ label: 'Delta', value: 'd' }
	] as const;
	const readonlyControlValues = $derived(`${checkbox}:${slider}:${radio}:${segmented}`);
	const readonlyControlEvents = $derived(
		`${checkboxChanges}:${checkboxClicks}:${checkboxNativeChanges}|${sliderChanges}:${sliderInputs}:${sliderNativeChanges}:${sliderKeys}:${sliderPointers}|${radioChanges}:${radioClicks}:${radioNativeChanges}:${radioKeys}|${segmentedChanges}:${segmentedNativeChanges}`
	);
	const readonlyBoundaryValues = $derived(
		`${boundaryCheckbox}:${boundarySlider}:${boundaryRadio}:${boundarySegmented}`
	);

	function updateFromOwner(): void {
		checkbox = false;
		slider = 55;
		radio = 'd';
		segmented = 'd';
	}
</script>

<ZProvider direction="rtl">
	<form data-testid="readonly-controls-form">
		<ZField error="Readonly checkbox error" label="Readonly checkbox" readonly>
			<ZCheckbox
				bind:checked={checkbox}
				data-testid="readonly-checkbox"
				defaultChecked
				name="consent"
				onchange={() => (checkboxNativeChanges += 1)}
				onclick={() => (checkboxClicks += 1)}
				onCheckedChange={() => (checkboxChanges += 1)}
				required
				value="yes"
			/>
		</ZField>

		<ZField error="Readonly slider error" label="Readonly slider" readonly>
			<ZSlider
				bind:value={slider}
				data-testid="readonly-slider"
				defaultValue={35}
				name="threshold"
				onchange={() => (sliderNativeChanges += 1)}
				oninput={() => (sliderInputs += 1)}
				onkeydown={() => (sliderKeys += 1)}
				onpointerdown={() => (sliderPointers += 1)}
				onValueChange={() => (sliderChanges += 1)}
				required
				step={5}
			/>
		</ZField>

		<ZField error="Readonly radio error" label="Readonly radio" readonly>
			<ZRadioGroup
				bind:value={radio}
				aria-label="Readonly radio"
				data-testid="readonly-radio-group"
				defaultValue="b"
				name="choice"
				onValueChange={() => (radioChanges += 1)}
				orientation="horizontal"
				required
			>
				<label>
					<ZRadioGroupItem data-testid="readonly-radio-a" value="a" />
					Alpha</label
				>
				<label>
					<ZRadioGroupItem data-testid="readonly-radio-b" value="b" />
					Beta</label
				>
				<label>
					<ZRadioGroupItem data-testid="readonly-radio-c" disabled value="c" />
					Charlie</label
				>
				<label>
					<ZRadioGroupItem
						data-testid="readonly-radio-d"
						onchange={() => (radioNativeChanges += 1)}
						onclick={() => (radioClicks += 1)}
						onkeydown={() => (radioKeys += 1)}
						value="d"
					/>
					Delta</label
				>
			</ZRadioGroup>
		</ZField>

		<ZField label="Readonly segmented" readonly>
			<ZSegmented
				bind:value={segmented}
				aria-label="Readonly segmented"
				data-testid="readonly-segmented"
				defaultValue="b"
				{items}
				name="period"
				onchange={() => (segmentedNativeChanges += 1)}
				onValueChange={() => (segmentedChanges += 1)}
			/>
		</ZField>

		<button data-testid="readonly-owner-update" type="button" onclick={updateFromOwner}
			>Owner update
		</button>
		<button data-testid="readonly-reset" type="reset">Reset</button>
	</form>

	<output data-testid="readonly-control-values">{readonlyControlValues}</output>
	<output data-testid="readonly-control-events">{readonlyControlEvents}</output>

	<section data-testid="readonly-safety-boundaries">
		<ZField label="Checkbox safety boundary" readonly>
			<ZCheckbox
				bind:checked={boundaryCheckbox}
				data-testid="boundary-checkbox"
				onCheckedChange={() => undefined}
				readonly={false}
			/>
		</ZField>
		<ZField label="Slider safety boundary" readonly>
			<ZSlider
				bind:value={boundarySlider}
				data-testid="boundary-slider"
				onValueChange={() => undefined}
				readonly={false}
			/>
		</ZField>
		<ZField label="Radio safety boundary" readonly>
			<ZRadioGroup
				bind:value={boundaryRadio}
				aria-label="Radio safety boundary"
				data-testid="boundary-radio-group"
				onValueChange={() => undefined}
				orientation="horizontal"
				readonly={false}
			>
				<ZRadioGroupItem aria-label="Boundary alpha" value="a" />
				<ZRadioGroupItem aria-label="Boundary beta" data-testid="boundary-radio-b" value="b" />
			</ZRadioGroup>
		</ZField>
		<ZField label="Segmented safety boundary" readonly>
			<ZSegmented
				bind:value={boundarySegmented}
				aria-label="Segmented safety boundary"
				data-testid="boundary-segmented"
				{items}
				onValueChange={() => undefined}
				readonly={false}
			/>
		</ZField>
	</section>
	<output data-testid="readonly-boundary-values">{readonlyBoundaryValues}</output>
</ZProvider>
