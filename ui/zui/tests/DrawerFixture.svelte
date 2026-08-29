<script lang="ts">
	import {
		ZDrawer,
		ZDrawerClose,
		ZDrawerContent,
		ZDrawerDescription,
		ZDrawerOverlay,
		ZDrawerTitle,
		ZDrawerTrigger,
		ZProvider,
		type DrawerPlacement
	} from '../src/entrypoints/index.js';

	let {
		defaultOpen = false,
		direction = 'ltr',
		motion = 'auto',
		placement = 'end',
		size = 'medium'
	}: {
		defaultOpen?: boolean;
		direction?: 'ltr' | 'rtl';
		motion?: 'auto' | 'full' | 'reduced';
		placement?: DrawerPlacement;
		size?: 'full' | 'large' | 'medium' | 'small';
	} = $props();
	let open = $state<boolean>();
</script>

<ZProvider {direction} {motion}>
	<div data-testid="drawer-inline-host">
		<ZDrawer bind:open {defaultOpen}>
			<ZDrawerTrigger data-testid="drawer-trigger">Open drawer</ZDrawerTrigger>
			<ZDrawerOverlay data-testid="drawer-overlay" />
			<ZDrawerContent data-testid="drawer-content" {placement} {size}>
				<ZDrawerTitle>Fixture drawer</ZDrawerTitle>
				<ZDrawerDescription>Fixture drawer description</ZDrawerDescription>
				<input aria-label="Drawer input" name="drawer-input" />
				<ZDrawerClose data-testid="drawer-close">Close drawer</ZDrawerClose>
			</ZDrawerContent>
		</ZDrawer>
		<output data-testid="drawer-output">{open}</output>
	</div>
</ZProvider>
