<script lang="ts">
	import { ZCommand, type CommandActionEvent, type CommandItem } from '../src/entrypoints/index.js';

	let items = $state<readonly CommandItem[]>([
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
		{ disabled: true, group: 'Deploy', key: 'production', label: 'Deploy production' },
		{ group: 'Deploy', key: 1, label: 'Numeric one' },
		{ group: 'Deploy', key: '1', label: 'String one' }
	]);
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
<button
	type="button"
	data-testid="command-remove-preview"
	onclick={() => (items = items.filter(({ key }) => key !== 'preview'))}
>
	Remove preview command
</button>
