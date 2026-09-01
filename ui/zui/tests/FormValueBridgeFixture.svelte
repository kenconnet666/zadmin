<script lang="ts">
	import FormValueBridge from '../src/runtime/form/FormValueBridge.svelte';
	import type { FormValueEntry, PrimitiveFormValue } from '../src/runtime/form/form-value.js';

	const defaultValues = Object.freeze<readonly PrimitiveFormValue[]>(['alpha', 'alpha', 2, false]);
	let bridgeMounted = $state(true);
	let disabled = $state(false);
	let firstFormId = $state('form-value-owner-a');
	let form = $state(firstFormId);
	let values = $state<readonly PrimitiveFormValue[]>(defaultValues);
	let start = $state<string | undefined>('2026-09-01');
	let end = $state<string | undefined>('2026-09-03');
	let resets = $state(0);
	const entries = $derived<readonly FormValueEntry[]>([
		['tag', values],
		['range.start', start],
		['range.end', end],
		['omitted', undefined]
	]);

	function resetFromForm(): void {
		resets += 1;
		values = defaultValues;
		start = '2026-09-01';
		end = '2026-09-03';
	}
</script>

<form id={firstFormId} data-testid="form-value-owner-a">
	<button type="reset">Reset first owner</button>
</form>
<form id="form-value-owner-b" data-testid="form-value-owner-b">
	<button type="reset">Reset second owner</button>
</form>

{#if bridgeMounted}
	<FormValueBridge {disabled} {entries} {form} onReset={resetFromForm} />
{/if}

<button
	type="button"
	data-testid="form-value-update"
	onclick={() => {
		values = ['beta', 'beta', 3, true];
		start = '2026-10-10';
		end = '2026-10-12';
	}}>Update entries</button
>
<button
	type="button"
	data-testid="form-value-clear"
	onclick={() => {
		values = [];
		start = undefined;
		end = undefined;
	}}>Clear entries</button
>
<button
	type="button"
	data-testid="form-value-toggle-disabled"
	onclick={() => (disabled = !disabled)}>Toggle disabled</button
>
<button
	type="button"
	data-testid="form-value-rename-owner"
	onclick={() => (firstFormId = 'form-value-owner-renamed')}>Rename first owner</button
>
<button type="button" data-testid="form-value-follow-renamed" onclick={() => (form = firstFormId)}
	>Follow renamed owner</button
>
<button
	type="button"
	data-testid="form-value-move-owner"
	onclick={() => (form = 'form-value-owner-b')}>Move to second owner</button
>
<button type="button" data-testid="form-value-unmount" onclick={() => (bridgeMounted = false)}
	>Unmount bridge</button
>
<output data-testid="form-value-output">{form}:{resets}</output>
