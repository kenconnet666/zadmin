<script lang="ts">
	import {
		ZContextMenu,
		ZContextMenuContent,
		ZContextMenuTrigger,
		ZMenuItem
	} from '../src/entrypoints/index.js';
	let { defaultOpen = false }: { defaultOpen?: boolean } = $props();
	let open = $state<boolean>();
	let action = $state('none');
</script>

<ZContextMenu bind:open {defaultOpen}>
	<ZContextMenuTrigger data-testid="context-trigger">Target</ZContextMenuTrigger>
	<ZContextMenuContent
		ariaLabel="Fixture context menu"
		data-testid="context-content"
		onAction={(event) => (action = String(event.value))}
	>
		<ZMenuItem data-testid="context-inspect" value="inspect">Inspect</ZMenuItem>
		<ZMenuItem data-testid="context-delete" value="delete">Delete</ZMenuItem>
	</ZContextMenuContent>
</ZContextMenu>
<button data-testid="context-outside">Outside</button>
<output data-testid="context-output">{open}:{action}</output>
