<script lang="ts">
	import {
		ZCommandPalette,
		type CommandActionEvent,
		type CommandItem
	} from '../src/entrypoints/index.js';

	const items: readonly CommandItem[] = [
		{ key: 'theme', keywords: ['dark'], label: 'Toggle theme' },
		{ key: 'docs', keywords: ['api'], label: 'Open docs' }
	];
	let { defaultOpen = false }: { defaultOpen?: boolean } = $props();
	let open = $state(false);
	let action = $state('none');
</script>

<ZCommandPalette
	bind:open
	{defaultOpen}
	description="Choose an action"
	inputLabel="Search palette"
	listLabel="Palette commands"
	onAction={(event: CommandActionEvent) => (action = String(event.item.key))}
	shortcut={{ key: 'k', modKey: true }}
	title="Quick actions"
	triggerLabel="Open palette"
	{items}
/>
<output data-testid="command-palette-output">{open}:{action}</output>
