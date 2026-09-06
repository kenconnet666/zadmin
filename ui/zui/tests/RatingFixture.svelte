<script lang="ts">
	import ZField from '../src/components/input/ZField.svelte';
	import ZRating, { type ZRatingItemContext } from '../src/components/input/ZRating.svelte';
	const sizes = ['xsmall', 'small', 'medium', 'large', 'xlarge'] as const;
	let value = $state(2.5);
	let changes = $state(0);
	let hover = $state(0);
	let hoverChanges = $state(0);
	let resets = $state(0);
</script>

{#snippet customItem(context: ZRatingItemContext)}
	<span
		data-custom-frozen={Object.isFrozen(context)}
		data-custom-index={context.index}
		data-custom-state={context.state}>◆</span
	>
{/snippet}

<form data-testid="rating-form">
	<ZField
		label="Service rating"
		description="Choose in half steps"
		name="rating"
		required
		size="large"
	>
		<ZRating
			bind:value
			count={5}
			fractions={2}
			defaultValue={2.5}
			itemLabel={(option) => option + ' of 5 stars'}
			onFormReset={() => (resets += 1)}
			onHoverChange={(next) => {
				hover = next;
				hoverChanges += 1;
			}}
			onValueChange={() => (changes += 1)}
			data-testid="rating-main"
			tone="warning"
		/>
	</ZField>
	<button data-testid="rating-reset" type="reset">Reset</button>
</form>
<output data-testid="rating-output">{value}|{changes}|{hover}|{hoverChanges}|{resets}</output>

<form data-testid="rating-readonly-form">
	<ZRating
		label="Readonly rating"
		name="readonly-rating"
		readonly
		value={3.5}
		fractions={2}
		data-testid="rating-readonly"
	/>
</form>
<form data-testid="rating-disabled-form">
	<ZField disabled label="Disabled rating" name="disabled-rating">
		<ZRating value={3} data-testid="rating-disabled" />
	</ZField>
</form>
<ZRating
	label="RTL rating"
	name="rtl-rating"
	value={2}
	fractions={2}
	dir="rtl"
	data-testid="rating-rtl"
/>
<section data-testid="rating-sizes">
	{#each sizes as size (size)}
		<ZRating
			label={'Rating ' + size}
			value={1}
			count={1}
			{size}
			data-testid={'rating-size-' + size}
		/>
	{/each}
</section>
<ZRating
	label="Custom rating"
	value={2}
	count={3}
	item={customItem}
	size="large"
	data-testid="rating-custom"
/>
<fieldset disabled data-testid="rating-native-fieldset">
	<legend
		><ZRating
			label="Legend rating"
			name="legend-rating"
			value={1}
			data-testid="rating-legend"
		/></legend
	>
	<ZRating label="Fieldset rating" name="fieldset-rating" value={1} data-testid="rating-fieldset" />
</fieldset>
