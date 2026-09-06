<script lang="ts">
	import { ZAnchor, ZScrollArea, ZStack, ZText } from '@zadmin/zui';

	const items = [
		{ key: 'overview', label: '概览', href: '#anchor-overview', targetId: 'anchor-overview' },
		{ key: 'usage', label: '用法', href: '#anchor-usage', targetId: 'anchor-usage' },
		{
			key: 'accessibility',
			label: '可访问性',
			href: '#anchor-accessibility',
			targetId: 'anchor-accessibility'
		}
	] as const;
	let scrollContainer = $state<HTMLDivElement | null>(null);
</script>

<ZStack direction="row" gap="large" align="start" style="max-width: 100%;">
	<ZAnchor
		aria-label="页面目录"
		{items}
		history={false}
		{scrollContainer}
		style="min-width: 8rem;"
	/>
	<ZScrollArea
		bind:ref={scrollContainer}
		aria-label="页面内容"
		height="18rem"
		style="min-width: 0; flex: 1;"
		scrollbarGutter="stable"
	>
		<div style="padding: 0.75rem;">
			<section id="anchor-overview" style="scroll-margin-block-start: 3rem; min-height: 8rem;">
				<ZText as="h3">概览</ZText><ZText>真实section目标由targetId绑定，导航仍是原生anchor。</ZText
				>
			</section>
			<section id="anchor-usage" style="scroll-margin-block-start: 3rem; min-height: 8rem;">
				<ZText as="h3">用法</ZText><ZText
					>scroll-margin为固定标题留下目标偏移，不在组件内部写死像素。</ZText
				>
			</section>
			<section id="anchor-accessibility" style="scroll-margin-block-start: 3rem; min-height: 8rem;">
				<ZText as="h3">可访问性</ZText><ZText>active观察和路由current由不同owner管理。</ZText>
			</section>
		</div>
	</ZScrollArea>
</ZStack>
