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

	<ZText weight="semibold">RTL 两项 roving</ZText>
	<ZToolbar aria-label="RTL 文档操作" dir="rtl" gap="small">
		<ZToolbarItem value="rtl-first">
			{#snippet children(props)}
				<ZButton {...props} variant="outline">RTL First</ZButton>
			{/snippet}
		</ZToolbarItem>
		<ZToolbarItem value="rtl-last">
			{#snippet children(props)}
				<ZButton {...props} variant="outline">RTL Last</ZButton>
			{/snippet}
		</ZToolbarItem>
	</ZToolbar>

	<ZText weight="semibold">嵌套 Toolbar 的物理边界</ZText>
	<ZToolbar aria-label="外层文档操作" gap="small">
		<ZToolbarItem value="outer-first">
			{#snippet children(props)}
				<ZButton {...props} variant="outline">Outer First</ZButton>
			{/snippet}
		</ZToolbarItem>
		<ZToolbar aria-label="内层文档操作" gap="small">
			<ZToolbarItem value="inner-first">
				{#snippet children(props)}
					<ZButton {...props} variant="outline">Inner First</ZButton>
				{/snippet}
			</ZToolbarItem>
			<ZToolbarItem value="inner-last">
				{#snippet children(props)}
					<ZButton {...props} variant="outline">Inner Last</ZButton>
				{/snippet}
			</ZToolbarItem>
		</ZToolbar>
		<ZToolbarItem value="outer-last">
			{#snippet children(props)}
				<ZButton {...props} variant="outline">Outer Last</ZButton>
			{/snippet}
		</ZToolbarItem>
	</ZToolbar>
</ZStack>
