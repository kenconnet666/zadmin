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
		type DrawerPlacement,
		type DrawerSize,
		type ZuiPortalContainer
	} from '../src/entrypoints/index.js';

	let {
		defaultOpen = false,
		direction = 'ltr',
		dismissOnEscape = true,
		dismissOnPointerOutside = true,
		motion = 'auto',
		placement = 'end',
		portalContainer,
		size = 'medium'
	}: {
		defaultOpen?: boolean;
		direction?: 'ltr' | 'rtl';
		dismissOnEscape?: boolean;
		dismissOnPointerOutside?: boolean;
		motion?: 'auto' | 'full' | 'reduced';
		placement?: DrawerPlacement;
		portalContainer?: ZuiPortalContainer;
		size?: DrawerSize;
	} = $props();
	let open = $state<boolean>();
</script>

<ZProvider {direction} {motion} {portalContainer}>
	<div data-testid="drawer-inline-host">
		<ZDrawer bind:open {defaultOpen}>
			<ZDrawerTrigger data-testid="drawer-trigger">Open drawer</ZDrawerTrigger>
			<ZDrawerOverlay data-testid="drawer-overlay" />
			<ZDrawerContent
				data-testid="drawer-content"
				{dismissOnEscape}
				{dismissOnPointerOutside}
				{placement}
				{size}
			>
				<ZDrawerTitle>Fixture drawer</ZDrawerTitle>
				<ZDrawerDescription>Fixture drawer description</ZDrawerDescription>
				<input aria-label="Drawer input" name="drawer-input" />
				<ZDrawerClose data-testid="drawer-close">Close drawer</ZDrawerClose>
			</ZDrawerContent>
		</ZDrawer>
		<output data-testid="drawer-output">{open}</output>
	</div>
</ZProvider>
