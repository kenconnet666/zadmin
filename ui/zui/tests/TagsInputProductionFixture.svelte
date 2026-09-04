<script lang="ts">
	import { ZButton, ZField, ZTagsInput } from '../src/entrypoints/index.js';

	let values = $state<readonly string[]>(['alpha', 'beta', 'gamma']);
	let draft = $state('');
	let changes = $state(0);
	let staticValues = $state<readonly string[]>(['one', 'two']);
	let identityValues = $state<readonly string[]>(['same', 'same', 'third']);
</script>

<form id="tags-production-form" data-testid="tags-production-form">
	<ZButton type="reset">Reset</ZButton>
</form>
<ZField
	error="Production tags are under review."
	label="Production tags"
	name="tag"
	required
	size="small"
>
	<ZTagsInput
		bind:inputValue={draft}
		bind:value={values}
		data-testid="tags-production"
		defaultValue={['alpha', 'beta', 'gamma']}
		editable
		form="tags-production-form"
		maxVisibleTags={2}
		onValueChange={() => (changes += 1)}
		transform={(value) => value.toLocaleLowerCase().replaceAll(/\s+/gu, '-')}
		validate={(value) => /^[a-z][a-z0-9-]*$/u.test(value)}
	/>
</ZField>
<ZButton data-testid="tags-owner-clear" onclick={() => (values = [])}>Owner clear</ZButton>
<ZButton data-testid="tags-owner-prepend" onclick={() => (values = ['owner', ...values])}
	>Owner prepend</ZButton
>
<output data-testid="tags-production-output">{values.join(',')}:{changes}:{draft}</output>
<ZTagsInput bind:value={staticValues} data-testid="tags-production-static" />
<output data-testid="tags-production-static-output">{staticValues.join(',')}</output>
<ZTagsInput
	allowDuplicates
	bind:value={identityValues}
	data-testid="tags-production-identity"
	defaultValue={['same', 'same', 'third']}
	editable
/>
<output data-testid="tags-production-identity-output">{identityValues.join(',')}</output>
<ZButton
	data-testid="tags-identity-controlled-prepend"
	onclick={() => (identityValues = ['owner', ...identityValues])}>Identity prepend</ZButton
>
<ZButton
	data-testid="tags-identity-controlled-replace"
	onclick={() => (identityValues = ['same', 'same'])}>Identity replace</ZButton
>
<ZTagsInput data-testid="tags-production-readonly" defaultValue={['locked']} readonly />
