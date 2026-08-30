<script lang="ts">
	import { ZCommand, type CommandActionEvent, type CommandItem } from '../src/entrypoints/index.js';

	const items: readonly CommandItem[] = [
		{
			description: 'Open the release dashboard',
			group: 'Navigation',
			key: 'overview',
			label: 'Open overview',
			shortcut: 'G O'
		},
		{
			group: 'Deploy',
			key: 'preview',
			keywords: ['deploy'],
			label: 'Deploy preview',
			shortcut: 'D P'
		},
		{ disabled: true, group: 'Deploy', key: 'production', label: 'Deploy production' }
	];
	let query = $state('');
	let action = $state('none');
	let escaped = $state(0);
</script>

<form data-testid="command-form">
	<ZCommand
		bind:query
		inputLabel="Search commands"
		listLabel="Commands"
		onAction={(event: CommandActionEvent) => (action = String(event.item.key))}
		onEscape={() => (escaped += 1)}
		loop={false}
		{items}
	/>
	<button type="reset">Reset</button>
	<output data-testid="command-output">{query}:{action}:{escaped}</output>
</form>
