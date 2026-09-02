<script lang="ts">
	import { ZButton, ZField, ZNumberField, ZStack } from '../src/entrypoints/index.js';

	let localeValue = $state<number | undefined>(1.5);
	let controlledValue = $state<number | undefined>(12.5);
	let customValue = $state<number | undefined>(0.25);
	let outOfRangeValue = $state<number | undefined>(50);
</script>

<form data-testid="number-production-form">
	<ZStack gap="medium">
		<ZField label="Amount" name="amount" size="small">
			<ZNumberField
				bind:value={localeValue}
				defaultValue={1.5}
				locale="de-DE"
				max={5}
				min={0}
				pageStep={1}
				precision={2}
				step={0.25}
				data-testid="locale-number"
			/>
		</ZField>

		<ZNumberField
			bind:value={controlledValue}
			name="controlled"
			inputLabel="Controlled amount"
			step={0.25}
			data-testid="controlled-number"
		/>
		<div>
			<ZButton type="button" onclick={() => (controlledValue = undefined)}>Clear controlled</ZButton
			>
			<ZButton type="button" onclick={() => (controlledValue = 7.25)}>Set controlled</ZButton>
		</div>

		<ZNumberField
			bind:value={customValue}
			name="ratio"
			inputLabel="Ratio"
			precision={2}
			formatter={(value, { editing, defaultFormat }) => {
				const formatted = defaultFormat(value * 100, { maximumFractionDigits: 2 });
				return editing ? `${formatted}%` : `${formatted} percent`;
			}}
			parser={(input, { defaultParse }) => {
				const parsed = defaultParse(input.replace(/(?:\s*percent|%)/u, ''));
				return parsed.valid && parsed.value !== undefined
					? { partial: false, valid: true, value: parsed.value / 100 }
					: parsed;
			}}
			data-testid="custom-number"
		/>

		<ZNumberField
			allowOutOfRange
			bind:value={outOfRangeValue}
			inputLabel="Capacity"
			max={100}
			min={0}
			name="capacity"
			pageStep={25}
			data-testid="range-number"
		/>

		<ZNumberField
			defaultValue={4}
			inputLabel="Readonly replicas"
			name="replicas"
			readonly
			data-testid="readonly-number"
		/>

		<ZButton type="reset">Reset values</ZButton>
	</ZStack>
</form>

<output data-testid="locale-value">{localeValue ?? 'empty'}</output>
<output data-testid="controlled-value">{controlledValue ?? 'empty'}</output>
<output data-testid="custom-value">{customValue ?? 'empty'}</output>
<output data-testid="range-value">{outOfRangeValue ?? 'empty'}</output>
