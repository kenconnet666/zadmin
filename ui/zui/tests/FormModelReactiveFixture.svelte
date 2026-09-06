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
	let plainOwner = { count: 0 };
	const plainModel = createFormModel({
		defaultValues: plainOwner,
		read: () => plainOwner,
		write: (next) => {
			plainOwner = { count: next.count };
		}
	});
	let initializeSource = $state(1);
	let initializeOwner = { count: 0 };
	let initializeRuns = $state(0);
	let nextInitializeRun = 0;
	const initializeModel = createFormModel({
		defaultValues: initializeOwner,
		read: () => initializeOwner,
		write: (next) => {
			initializeOwner = { count: next.count };
		}
	});
	$effect(() => {
		const count = initializeSource;
		initializeRuns = ++nextInitializeRun;
		initializeModel.initialize({ count });
	});
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
<button data-testid="model-set-plain-owner" onclick={() => plainModel.setField('count', 1)}>
	Set plain owner
</button>
<button data-testid="model-change-initialize-source" onclick={() => (initializeSource += 1)}>
	Change initialize source
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
<output data-testid="model-plain-owner">{plainModel.values.count}</output>
<output data-testid="model-initialize-effect"
	>{initializeModel.values.count}|{initializeRuns}</output
>
