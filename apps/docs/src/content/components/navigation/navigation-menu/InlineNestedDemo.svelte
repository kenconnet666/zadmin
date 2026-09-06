<script lang="ts">
	import { ZNavigationMenu, ZStack, ZText } from '@zadmin/zui';

	const items = [
		{ key: 'home', label: '首页', href: '/docs' },
		{ kind: 'separator', key: 'separator' },
		{
			key: 'products',
			label: '产品',
			href: '/docs/components',
			children: [
				{ key: 'layout', label: '布局', href: '/docs/components/layout' },
				{ key: 'navigation', label: '导航', href: '/docs/components/navigation' }
			]
		},
		{
			kind: 'group',
			key: 'resources',
			label: '资源',
			children: [
				{ key: 'guides', label: '指南', href: '/docs/guides' },
				{ key: 'disabled', label: '暂不可用', href: '/docs/disabled', disabled: true }
			]
		},
		{ key: 'settings', label: '设置', href: '/docs/settings', disabled: true }
	] as const;
</script>

<ZStack gap="small" style="max-width: 100%;">
	<ZText weight="semibold">Inline nested navigation</ZText>
	<ZNavigationMenu aria-label="文档主导航" {items} currentKey="navigation" />
</ZStack>
