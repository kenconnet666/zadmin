<script lang="ts">
	import {
		ZContextMenu,
		ZContextMenuContent,
		ZContextMenuTrigger,
		ZMenuItem
	} from '../src/entrypoints/index.js';
	let { defaultOpen = false, prevent = false }: { defaultOpen?: boolean; prevent?: boolean } =
		$props();
	let open = $state<boolean>();
	let action = $state('none');
</script>

<div style="transform: translateX(40px)">
	<ZContextMenu bind:open {defaultOpen}>
		<ZContextMenuTrigger
			data-testid="context-trigger"
			oncontextmenu={(event) => prevent && event.preventDefault()}
			onkeydown={(event) => prevent && event.preventDefault()}>Target</ZContextMenuTrigger
		>
		<ZContextMenuContent
			ariaLabel="Fixture context menu"
			data-testid="context-content"
			onAction={(event) => (action = String(event.value))}
		>
			<ZMenuItem data-testid="context-inspect" value="inspect">Inspect</ZMenuItem>
			<ZMenuItem data-testid="context-delete" value="delete">Delete</ZMenuItem>
		</ZContextMenuContent>
	</ZContextMenu>
</div>
<button data-testid="context-outside">Outside</button>
<output data-testid="context-output">{open}:{action}</output>
