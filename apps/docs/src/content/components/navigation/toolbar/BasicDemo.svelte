<script lang="ts">
	import { ZButton, ZLink, ZStack, ZText, ZToolbar, ZToolbarItem } from '@zadmin/zui';
</script>

<ZStack gap="small">
	<ZText weight="semibold">保存、返回与外部导航</ZText>
	<ZToolbar aria-label="文档操作" gap="small">
		<ZToolbarItem value="save">
			{#snippet children(props)}
				<ZButton {...props} variant="solid" onclick={() => undefined}>保存</ZButton>
			{/snippet}
		</ZToolbarItem>
		<ZToolbarItem value="back">
			{#snippet children(props)}
				<ZButton {...props} variant="outline">返回</ZButton>
			{/snippet}
		</ZToolbarItem>
		<ZToolbarItem value="docs">
			{#snippet children(props)}
				<ZLink {...props} href="/docs">查看文档</ZLink>
			{/snippet}
		</ZToolbarItem>
	</ZToolbar>
</ZStack>
