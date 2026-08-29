<script lang="ts">
	import { ZCommand, type CommandActionEvent, type CommandItem } from '../src/entrypoints/index.js';

	const items: readonly CommandItem[] = [
		{ group: 'Navigation', key: 'overview', label: 'Open overview' },
		{ group: 'Deploy', key: 'preview', keywords: ['deploy'], label: 'Deploy preview' },
		{ disabled: true, group: 'Deploy', key: 'production', label: 'Deploy production' }
	];
	let query = $state('');
	let action = $state('none');
</script>

<form data-testid="command-form">
	<ZCommand
		bind:query
		inputLabel="Search commands"
		listLabel="Commands"
		onAction={(event: CommandActionEvent) => (action = String(event.item.key))}
		{items}
	/>
	<button type="reset">Reset</button>
	<output data-testid="command-output">{query}:{action}</output>
</form>
