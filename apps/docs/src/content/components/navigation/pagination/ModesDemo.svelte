<script lang="ts">
	import { ZPagination, ZProvider, ZStack, ZText, zhCNLocalePack } from '@zadmin/zui';

	let page = $state(12);
</script>

<ZStack gap="large">
	<ZStack gap="small">
		<ZText weight="semibold">Simple：可直接输入页码</ZText>
		<ZPagination aria-label="简单模式分页" bind:page mode="simple" totalPages={28} />
	</ZStack>
	<ZStack gap="small">
		<ZText weight="semibold">Compact：移动端与窄工具栏只保留状态</ZText>
		<ZPagination aria-label="紧凑模式分页" bind:page mode="compact" totalPages={28} />
	</ZStack>
	<ZProvider direction="rtl" locale="zh-CN" localePack={zhCNLocalePack}>
		<ZStack gap="small">
			<ZText weight="semibold">RTL：逻辑方向、图标和方向键一致</ZText>
			<ZPagination bind:page aria-label="RTL分页" mode="compact" totalPages={28} />
		</ZStack>
	</ZProvider>
	<ZText aria-live="polite" tone="muted">三个视图共享外部owner：page = {page}</ZText>
</ZStack>
