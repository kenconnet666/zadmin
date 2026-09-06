<script lang="ts">
	import ZForm, { type ZFormController } from '../src/components/input/ZForm.svelte';
	import ZFormField from '../src/components/input/ZFormField.svelte';
	import ZFormList from '../src/components/input/ZFormList.svelte';
	import ZInput from '../src/components/input/ZInput.svelte';
	import { createFormModel } from '../src/runtime/form/form-model.svelte.js';

	interface Row {
		name: string;
	}
	interface Values {
		rows: readonly Row[];
		summary: string;
	}

	let preflightWrites = $state(0);
	const preflightModel = createFormModel<Values>({
		defaultValues: { rows: [{ name: 'accepted' }], summary: '' },
		write: () => (preflightWrites += 1)
	});
	let preflightController = $state<ZFormController<Values, Values> | null>(null);
	let preflightResult = $state('none');

	const observerError = new Error('array observer failed');
	const observerModel = createFormModel<Values>({
		defaultValues: {
			rows: [{ name: 'first' }, { name: 'second' }],
			summary: ''
		},
		onValuesChange() {
			throw observerError;
		}
	});
	let observerController = $state<ZFormController<Values, Values> | null>(null);
	let observerResult = $state('none');

	export function seedPreflightState(): void {
		preflightController?.setErrors({ 'rows[0].name': ['Keep server error'] });
		preflightController?.setFieldFeedback(['rows', 0, 'name'], {
			warnings: ['Keep warning']
		});
	}
	export function preflightState() {
		return preflightController?.getFieldState(['rows', 0, 'name']);
	}
	export function preflightValues() {
		return preflightModel.values;
	}
	export function preflightWriteCount(): number {
		return preflightWrites;
	}
	export function observerState(index: number) {
		return observerController?.getFieldState(['rows', index, 'name']);
	}
	export function observerValues() {
		return observerModel.values;
	}
	export function seedObserverState(): void {
		observerController?.setFieldFeedback(['rows', 0, 'name'], { warnings: ['First row'] });
	}
</script>

<ZForm bind:controller={preflightController} model={preflightModel}>
	<ZFormList name="rows">
		{#snippet children(rows, operations)}
			{#each rows as row (row.id)}
				<div data-preflight-row={row.id}>
					<ZFormField name={[...row.path, 'name']} label="Preflight row">
						<ZInput data-testid="preflight-input" />
					</ZFormField>
				</div>
			{/each}
			<button
				type="button"
				data-testid="preflight-insert"
				onclick={() => {
					try {
						preflightResult = String(operations.insert(0, { name: 'rejected' }));
					} catch (error) {
						preflightResult = error instanceof Error ? error.message : String(error);
					}
				}}>Insert conflicting row</button
			>
		{/snippet}
	</ZFormList>
	<ZFormField name="summary" htmlName="rows[1].name" label="Stable explicit name">
		<ZInput />
	</ZFormField>
</ZForm>
<output data-testid="preflight-result">{preflightResult}</output>

<ZForm bind:controller={observerController} model={observerModel}>
	<ZFormList name="rows">
		{#snippet children(rows, operations)}
			{#each rows as row (row.id)}
				<div data-observer-row={row.id}>
					<ZFormField name={[...row.path, 'name']} label="Observer row">
						<ZInput />
					</ZFormField>
				</div>
			{/each}
			<button
				type="button"
				data-testid="observer-move"
				onclick={() => {
					try {
						observerResult = String(operations.move(0, 1));
					} catch (error) {
						observerResult = error instanceof Error ? error.message : String(error);
					}
				}}>Move through throwing observer</button
			>
		{/snippet}
	</ZFormList>
</ZForm>
<output data-testid="observer-result">{observerResult}</output>
