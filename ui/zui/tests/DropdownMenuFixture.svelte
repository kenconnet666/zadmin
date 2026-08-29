<script lang="ts">
	import {
		ZDropdownMenu,
		ZDropdownMenuContent,
		ZDropdownMenuTrigger,
		ZMenuItem
	} from '../src/entrypoints/index.js';
	let { defaultOpen = false }: { defaultOpen?: boolean } = $props();
	let open = $state<boolean>();
	let action = $state('none');
</script>

<ZDropdownMenu bind:open {defaultOpen}>
	<ZDropdownMenuTrigger data-testid="dropdown-trigger">Actions</ZDropdownMenuTrigger>
	<ZDropdownMenuContent
		data-testid="dropdown-content"
		onAction={(event) => (action = String(event.value))}
	>
		<ZMenuItem data-testid="dropdown-inspect" value="inspect">Inspect</ZMenuItem>
		<ZMenuItem data-testid="dropdown-copy" value="copy">Copy</ZMenuItem>
		<ZMenuItem
			data-testid="dropdown-stay"
			onSelect={(event) => event.preventDefault()}
			value="stay"
		>
			Stay open
		</ZMenuItem>
	</ZDropdownMenuContent>
</ZDropdownMenu>
<button data-testid="dropdown-outside">Outside</button>
<output data-testid="dropdown-output">{open}:{action}</output>
