<script lang="ts">
	import {
		ZForm,
		ZFormField,
		ZFormList,
		ZInput,
		ZSortable,
		type SortableMoveRequest,
		type ZFormController
	} from '../src/entrypoints/index.js';
	import type { FormArrayRow } from '../src/runtime/form/form-array.svelte.js';
	import { createFormModel } from '../src/runtime/form/form-model.svelte.js';

	interface Row {
		readonly id: string;
		readonly name: string;
	}
	interface Values {
		readonly rows: readonly Row[];
	}

	const defaults: Values = {
		rows: [
			{ id: 'alpha', name: 'Alpha' },
			{ id: 'beta', name: 'Beta' },
			{ id: 'gamma', name: 'Gamma' }
		]
	};
	let owner = $state<Values>(defaults);
	const model = createFormModel({
		defaultValues: defaults,
		read: () => owner,
		write: (next) => (owner = next)
	});
	let controller = $state<ZFormController<Values, Values> | null>(null);
	let lastRequest = $state('none');
	let reorderReadonly = $state(false);

	export function setReorderReadonly(next: boolean): void {
		reorderReadonly = next;
	}

	export function seedState(): void {
		controller?.setErrors({ 'rows[0].name': ['Sortable server error'] });
		controller?.setFieldFeedback(['rows', 0, 'name'], { warnings: ['Sortable warning'] });
	}
	export function fieldState(index: number) {
		return controller?.getFieldState(['rows', index, 'name']);
	}
	export function formState() {
		return controller?.getState();
	}
	export function values(): Values {
		return owner;
	}
</script>

<ZForm bind:controller {model} data-testid="sortable-form">
	<ZFormList name="rows" getRowKey={(row: Row) => row.id} data-testid="sortable-form-list">
		{#snippet children(rows, operations)}
			<ZSortable
				readonly={reorderReadonly}
				items={rows}
				itemKey={(row) => row.id}
				itemLabel={(row) => row.value.name}
				onMoveRequest={(request: SortableMoveRequest<FormArrayRow<Row>, string>) => {
					lastRequest = `${request.source}:${request.fromIndex}:${request.toIndex}`;
					return operations.move(request.fromIndex, request.toIndex);
				}}
				aria-label="Sortable form rows"
				data-testid="sortable-form-rows"
			>
				{#snippet item(row)}
					<ZFormField name={[...row.path, 'name']} label={`Name ${row.value.id}`}>
						<ZInput data-testid={`sortable-form-input-${row.id}`} />
					</ZFormField>
				{/snippet}
			</ZSortable>
		{/snippet}
	</ZFormList>
	<button type="reset">Reset sortable form</button>
</ZForm>
<output data-testid="sortable-form-values">{owner.rows.map((row) => row.name).join(',')}</output>
<output data-testid="sortable-form-request">{lastRequest}</output>
