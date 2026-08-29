<script lang="ts">
	import { ZMention, type MentionItem } from '../src/entrypoints/index.js';

	const items: readonly MentionItem[] = [
		{ key: 'alice', label: 'Alice', value: 'alice' },
		{ key: 'alex', label: 'Alex', value: 'alex' },
		{ disabled: true, key: 'archive', label: 'Archive' }
	];
	let value = $state('Notify ');
</script>

<form data-testid="mention-form">
	<ZMention aria-label="Message" bind:value defaultValue="Notify " name="message" {items} />
	<button type="reset">Reset</button>
	<output data-testid="mention-output">{value}</output>
</form>
