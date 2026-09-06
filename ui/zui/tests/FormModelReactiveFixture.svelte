<script lang="ts">
	import { createFormModel } from '../src/runtime/form/form-model.svelte.js';
	import { createFormArray } from '../src/runtime/form/form-array.svelte.js';

	let owner = $state({ account: { name: 'Ada' }, rows: [{ id: 1 }] });
	const model = createFormModel({ defaultValues: owner, read: () => owner });
	const identityModel = createFormModel({
		defaultValues: { rows: [{ value: 'same' }, { value: 'same' }] }
	});
	const identityArray = createFormArray<{ value: string }, typeof identityModel.values>(
		identityModel,
		'rows'
	);
</script>

<button data-testid="model-mutate-name" onclick={() => (owner.account.name = 'Bob')}>
	Mutate name
</button>
<button data-testid="model-append-row" onclick={() => owner.rows.push({ id: 2 })}>
	Append row
</button>
<button data-testid="model-move-equal-rows" onclick={() => identityArray.move(0, 1)}>
	Move equal rows
</button>
<output data-testid="model-reactive-output"
	>{model.values.account.name}|{model.values.rows.length}|{Object.is(
		model.values,
		model.values
	)}</output
>
<output data-testid="model-array-identity"
	>{identityArray.rows.map((row) => row.id).join(',')}</output
>
