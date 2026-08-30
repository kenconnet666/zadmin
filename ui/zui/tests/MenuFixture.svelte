<script lang="ts">
	import {
		ZMenu,
		ZMenuGroup,
		ZMenuItem,
		ZMenuLabel,
		ZMenuSeparator
	} from '../src/entrypoints/index.js';
	let { loop = true }: { loop?: boolean } = $props();
	let action = $state('none');
</script>

<ZMenu aria-label="Fixture actions" {loop} onAction={(event) => (action = String(event.value))}>
	<ZMenuGroup aria-labelledby="fixture-menu-label">
		<ZMenuLabel id="fixture-menu-label">Actions</ZMenuLabel>
		<ZMenuItem
			data-testid="menu-alpha"
			onclick={() => undefined}
			onfocus={() => undefined}
			onkeydown={() => undefined}
			onpointermove={() => undefined}
			value="alpha">Alpha</ZMenuItem
		>
		<ZMenuItem data-testid="menu-beta" disabled value="beta">Beta</ZMenuItem>
		<ZMenuItem data-testid="menu-charlie" value="charlie">Charlie</ZMenuItem>
	</ZMenuGroup>
	<ZMenuSeparator />
	<ZMenuItem data-testid="menu-delta" onSelect={(event) => event.preventDefault()} value="delta">
		Delta
	</ZMenuItem>
</ZMenu>
<output data-testid="menu-output">{action}</output>
