<script lang="ts">
	import { ZMention, type MentionItem } from '../src/entrypoints/index.js';

	const items: readonly MentionItem[] = [
		{ description: 'Platform owner', key: 'alice', label: 'Alice', value: 'alice' },
		{ key: 'alex', label: 'Alex', value: 'alex' },
		{ disabled: true, key: 'archive', label: 'Archive' }
	];
	let { prevent = false }: { prevent?: boolean } = $props();
	let value = $state('Notify ');
</script>

<form data-testid="mention-form">
	<ZMention
		aria-label="Message"
		bind:value
		defaultValue="Notify "
		name="message"
		{items}
		triggers={['@', '#']}
		oninput={(event) => prevent && event.preventDefault()}
		onkeydown={(event) => prevent && event.preventDefault()}
		oncompositionend={(event) => prevent && event.preventDefault()}
	/>
	<button type="reset">Reset</button>
	<output data-testid="mention-output">{value}</output>
</form>
