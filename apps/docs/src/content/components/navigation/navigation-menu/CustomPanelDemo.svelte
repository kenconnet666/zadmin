<script lang="ts">
	import { ZButton, ZCard, ZLink, ZNavigationMenu, ZStack, ZText } from '@zadmin/zui';
</script>

{#snippet panel(context)}
	<ZStack direction="row" gap="small" wrap style="padding: 0.75rem; max-width: 100%;">
		<ZCard>
			<ZText weight="semibold">后台工作台</ZText>
			<ZLink href="/docs/workspace">查看工作台</ZLink>
		</ZCard>
		<ZCard>
			<ZText weight="semibold">数据门户</ZText>
			<ZLink href="/docs/data">查看数据门户</ZLink>
		</ZCard>
		<ZButton variant="ghost" onclick={context.close}>收起</ZButton>
	</ZStack>
{/snippet}

<ZNavigationMenu
	aria-label="解决方案导航"
	items={[
		{ key: 'solutions', label: '解决方案', panel },
		{ key: 'docs', label: '文档', href: '/docs' }
	]}
	mode="horizontal"
	currentKey="docs"
/>
