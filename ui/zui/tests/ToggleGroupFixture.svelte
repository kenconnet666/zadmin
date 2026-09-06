<script lang="ts">
	import ZToggleGroup from '../src/components/input/ZToggleGroup.svelte';

	const textItems = [
		{ value: 'a', label: 'A' },
		{ value: 'b', label: 'B' },
		{ value: 'c', label: 'C' }
	] as const;
	const binaryItems = [
		{ value: 'alpha', label: 'Alpha' },
		{ value: 'beta', label: 'Beta' }
	] as const;
	const typedItems: readonly { value: number | string; label: string }[] = [
		{ value: 1, label: 'Number one' },
		{ value: '1', label: 'String one' }
	];
	const typedDefaultValue: readonly (number | string)[] = [1, '1'];
	const keyboardItems = [
		{ value: 'key-a', label: 'Key A' },
		{ value: 'key-b', label: 'Key B' },
		{ value: 'key-c', label: 'Key C' }
	] as const;
	const sizes = ['xsmall', 'small', 'medium', 'large', 'xlarge'] as const;

	let value = $state<readonly (number | string)[]>([1]);
	let items = $state<readonly { value: string; label: string; disabled?: boolean }[]>(textItems);
	let changes = $state(0);
	let external: HTMLButtonElement | null = null;

	let emptySingle = $state<readonly string[]>(['alpha']);
	let emptySingleChanges = $state(0);
	let requiredSingle = $state<readonly string[]>(['alpha']);
	let requiredSingleChanges = $state(0);

	let typedValue = $state<readonly (number | string)[]>([1]);
	let typedChanges = $state(0);

	let keyboardValue = $state<readonly string[]>(['key-a']);
	let keyboardChanges = $state(0);
	let cancelledValue = $state<readonly string[]>(['key-a']);
	let cancelledChanges = $state(0);
	let cancelledKeydowns = $state(0);

	let readonlyValue = $state<readonly string[]>(['alpha']);
	let readonlyChanges = $state(0);
	let disabledValue = $state<readonly string[]>(['alpha']);
	let disabledChanges = $state(0);

	export function focus(value: string): void {
		document.querySelector<HTMLButtonElement>(`[data-testid="toggle-${value}"]`)?.focus();
	}
	export function disableB(): void {
		items = [
			{ value: 'a', label: 'A' },
			{ value: 'b', label: 'B', disabled: true },
			{ value: 'c', label: 'C' }
		];
	}
	export function removeC(): void {
		items = [
			{ value: 'a', label: 'A' },
			{ value: 'b', label: 'B', disabled: true }
		];
	}
	export function focusExternal(): void {
		external?.focus();
	}

	function cancelKeydown(event: KeyboardEvent): void {
		cancelledKeydowns += 1;
		event.preventDefault();
	}

	function typed(values: readonly (number | string)[]): string {
		return values.map((key) => `${typeof key}:${String(key)}`).join(',');
	}
</script>

<button bind:this={external} data-testid="toggle-external" type="button">External</button>
<ZToggleGroup
	bind:value
	{items}
	data-testid="toggle-group"
	name="choice"
	onValueChange={() => (changes += 1)}
>
	{#snippet item(entry)}<span data-testid={`toggle-${entry.value}`}>{entry.label}</span>{/snippet}
</ZToggleGroup>
<ZToggleGroup
	items={textItems.slice(0, 2)}
	data-testid="toggle-group-roving-off"
	roving={false}
	selectionMode="multiple"
/>
<output data-testid="toggle-value">{typed(value)}:{changes}</output>

<section>
	<ZToggleGroup
		bind:value={emptySingle}
		items={binaryItems}
		data-testid="toggle-single-empty"
		onValueChange={() => (emptySingleChanges += 1)}
	/>
	<output data-testid="toggle-single-empty-output"
		>{emptySingle.join(',')}:{emptySingleChanges}</output
	>
	<ZToggleGroup
		bind:value={requiredSingle}
		items={binaryItems}
		allowEmpty={false}
		data-testid="toggle-single-required"
		onValueChange={() => (requiredSingleChanges += 1)}
	/>
	<output data-testid="toggle-single-required-output"
		>{requiredSingle.join(',')}:{requiredSingleChanges}</output
	>
</section>

<form data-testid="toggle-typed-form">
	<ZToggleGroup
		bind:value={typedValue}
		items={typedItems}
		defaultValue={typedDefaultValue}
		data-testid="toggle-typed"
		name="typed-choice"
		selectionMode="multiple"
		onValueChange={() => (typedChanges += 1)}
	/>
	<button data-testid="toggle-typed-reset" type="reset">Reset typed choices</button>
</form>
<output data-testid="toggle-typed-output">{typed(typedValue)}:{typedChanges}</output>

<section>
	<ZToggleGroup
		bind:value={keyboardValue}
		items={keyboardItems}
		data-testid="toggle-keyboard"
		onValueChange={() => (keyboardChanges += 1)}
	/>
	<output data-testid="toggle-keyboard-output">{keyboardValue.join(',')}:{keyboardChanges}</output>
	<ZToggleGroup
		bind:value={cancelledValue}
		items={keyboardItems}
		data-testid="toggle-keydown-cancelled"
		onkeydown={cancelKeydown}
		onValueChange={() => (cancelledChanges += 1)}
	/>
	<output data-testid="toggle-keydown-cancelled-output"
		>{cancelledValue.join(',')}:{cancelledChanges}:{cancelledKeydowns}</output
	>
</section>

<section>
	<ZToggleGroup
		bind:value={readonlyValue}
		items={binaryItems}
		data-testid="toggle-readonly"
		readonly
		onValueChange={() => (readonlyChanges += 1)}
	/>
	<output data-testid="toggle-readonly-output">{readonlyValue.join(',')}:{readonlyChanges}</output>
	<form data-testid="toggle-disabled-form">
		<ZToggleGroup
			bind:value={disabledValue}
			items={binaryItems}
			data-testid="toggle-disabled"
			disabled
			name="disabled-choice"
			onValueChange={() => (disabledChanges += 1)}
		/>
	</form>
	<output data-testid="toggle-disabled-output">{disabledValue.join(',')}:{disabledChanges}</output>
</section>

<section data-testid="toggle-sizes">
	{#each sizes as size (size)}
		<ZToggleGroup
			aria-label={`Toggle ${size}`}
			items={binaryItems}
			data-testid={`toggle-size-${size}`}
			{size}
		/>
	{/each}
</section>
