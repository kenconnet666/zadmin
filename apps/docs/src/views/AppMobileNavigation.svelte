<script module lang="ts">
	import { defineSlotRecipe } from '@zadmin/zui';

	const mobileNavigationRecipe = defineSlotRecipe(
		{
			layer: 'utilities',
			slots: ['trigger', 'content', 'header'] as const,
			base: {
				content: (s) => {
					s.display.flex;
					s.flexDirection.column;
					s.overflow.hidden;
					s.padding.px(0);
				},
				header: (s) => {
					s.borderBottomColor._border;
					s.borderBottomStyle.solid;
					s.borderBottomWidth._hairline;
					s.padding._large;
				},
				trigger: (s) => {
					s.display.none;
					s.flexShrink(0);
					s._media('(max-width: 48rem)', (mobile) => mobile.display.inlineFlex);
				}
			},
			variants: {}
		},
		import.meta
	);
</script>

<script lang="ts">
	import {
		ZDrawer,
		ZDrawerClose,
		ZDrawerContent,
		ZDrawerDescription,
		ZDrawerOverlay,
		ZDrawerTitle,
		ZDrawerTrigger,
		ZIcon,
		ZStack,
		useZui
	} from '@zadmin/zui';
	import type { ComponentCatalogManifestEntry } from '../framework/catalog-manifest.generated.js';
	import AppSidebar from './AppSidebar.svelte';

	let {
		docs,
		currentGuideId,
		currentId
	}: {
		readonly docs: readonly ComponentCatalogManifestEntry[];
		readonly currentGuideId?: string;
		readonly currentId?: string;
	} = $props();
	const zui = useZui();
	const classes = $derived(zui.slots(mobileNavigationRecipe));
	let open = $state(false);
</script>

<ZDrawer bind:open>
	<ZDrawerTrigger
		class={classes.trigger}
		data-slot="mobile-navigation-trigger"
		aria-label="打开组件导航"
		size="small"
		variant="ghost"
	>
		<ZIcon name="menu" size={20} />
	</ZDrawerTrigger>
	<ZDrawerOverlay data-testid="docs-mobile-navigation-overlay" />
	<ZDrawerContent
		class={classes.content}
		data-testid="docs-mobile-navigation-drawer"
		placement="start"
		size="min(22rem, calc(100vw - 2.5rem))"
	>
		<ZStack class={classes.header} direction="row" align="start" justify="between" gap="medium">
			<ZStack gap="xsmall">
				<ZDrawerTitle>浏览 ZUI</ZDrawerTitle>
				<ZDrawerDescription>选择指南或组件；导航后自动关闭。</ZDrawerDescription>
			</ZStack>
			<ZDrawerClose aria-label="关闭组件导航" size="small" variant="ghost">
				<ZIcon name="close" size={18} />
			</ZDrawerClose>
		</ZStack>
		<AppSidebar
			{docs}
			{currentGuideId}
			{currentId}
			onNavigate={() => (open = false)}
			surface="drawer"
		/>
	</ZDrawerContent>
</ZDrawer>
