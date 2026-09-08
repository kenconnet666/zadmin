<script lang="ts">
	import {
		ZButton,
		ZNavigationMenu,
		ZStack,
		ZText,
		type NavigationMenuPanelContext
	} from '@zadmin/zui';

	let width = $state(240);
</script>

{#snippet panel(context: NavigationMenuPanelContext)}
	<ZStack gap="small" style="padding: 0.75rem; min-width: 14rem;">
		<ZText weight="semibold">面板 {context.key}</ZText>
		<ZButton variant="ghost" onclick={context.close}>关闭面板</ZButton>
	</ZStack>
{/snippet}

<ZStack gap="small" style="max-width: 100%;">
	<ZText weight="semibold">Horizontal panels与OverflowList</ZText>
	<ZStack direction="row" gap="small" wrap>
		<ZButton size="small" variant="outline" onclick={() => (width = 240)}>窄 240px</ZButton>
		<ZButton size="small" variant="outline" onclick={() => (width = 640)}>宽 640px</ZButton>
	</ZStack>
	<div style={`width: ${width}px; max-width: 100%;`}>
		<ZNavigationMenu
			aria-label="文档分类"
			items={[
				{ key: 'components', label: '组件', panel },
				{ key: 'patterns', label: '模式', panel },
				{ key: 'resources', label: '资源', href: '/docs/resources' },
				{ key: 'about', label: '关于', href: '/docs/about' }
			]}
			mode="horizontal"
			overflow
			currentKey="components"
		/>
	</div>
</ZStack>
