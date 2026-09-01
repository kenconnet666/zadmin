<script lang="ts">
	import {
		ZDrawer,
		ZDrawerClose,
		ZDrawerContent,
		ZDrawerDescription,
		ZDrawerOverlay,
		ZDrawerTitle,
		ZDrawerTrigger,
		ZProvider
	} from '../src/entrypoints/index.js';
</script>

<ZProvider motion="reduced">
	<ZDrawer>
		<ZDrawerTrigger data-testid="outer-trigger">Open outer</ZDrawerTrigger>
		<ZDrawerOverlay data-testid="outer-overlay" />
		<ZDrawerContent data-testid="outer-content" placement="end" size="medium">
			<ZDrawerTitle>Outer drawer</ZDrawerTitle>
			<ZDrawerDescription>Outer drawer description</ZDrawerDescription>
			<ZDrawer>
				<ZDrawerTrigger data-testid="inner-trigger">Open inner</ZDrawerTrigger>
				<ZDrawerOverlay data-testid="inner-overlay" />
				<ZDrawerContent data-testid="inner-content" placement="end" size="small">
					<ZDrawerTitle>Inner drawer</ZDrawerTitle>
					<ZDrawerDescription>Inner drawer description</ZDrawerDescription>
					<input aria-label="Inner drawer input" />
					<ZDrawerClose data-testid="inner-close">Close inner</ZDrawerClose>
				</ZDrawerContent>
			</ZDrawer>
			<ZDrawerClose data-testid="outer-close">Close outer</ZDrawerClose>
		</ZDrawerContent>
	</ZDrawer>
</ZProvider>
