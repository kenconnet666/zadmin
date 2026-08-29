<script lang="ts">
	import { ZTagsInput } from '../src/entrypoints/index.js';
	let values = $state<readonly string[]>(['alpha']);
	let inputValue = $state('');
	let changes = $state(0);
</script>

<form data-testid="tags-form">
	<ZTagsInput
		addLabel="Add fixture tag"
		aria-label="Fixture tags"
		bind:inputValue
		bind:values
		defaultValues={['alpha']}
		maxTags={4}
		name="tag"
		onValueChange={() => (changes += 1)}
	/>
	<button type="reset">Reset</button>
	<output data-testid="tags-output">{values.join(',')}:{changes}:{inputValue}</output>
</form>
