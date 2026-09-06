<script lang="ts">
	import { ZButton, ZInput, ZStack, ZText, ZToolbar, ZToolbarItem } from '@zadmin/zui';

	let query = $state('');
</script>

<ZStack gap="small">
	<ZText weight="semibold">输入框保留自己的编辑键</ZText>
	<ZToolbar aria-label="筛选工具" orientation="horizontal" gap="small">
		<ZToolbarItem value="filter">
			{#snippet children(props)}
				<ZButton {...props} variant="outline">筛选</ZButton>
			{/snippet}
		</ZToolbarItem>
		<ZToolbarItem value="refresh">
			{#snippet children(props)}
				<ZButton {...props} variant="outline">刷新</ZButton>
			{/snippet}
		</ZToolbarItem>
		<ZToolbarItem value="search" keyPolicy="control">
			{#snippet children(props)}
				<ZInput
					{...props}
					bind:value={query}
					aria-label="筛选"
					placeholder="输入后使用Home/End编辑"
				/>
			{/snippet}
		</ZToolbarItem>
	</ZToolbar>
	<ZText tone="muted"
		>query = {query ||
			'（空）'}；输入框放在末项，保留Home/End编辑。Tab离开后，重新进入会回到首个命令。</ZText
	>
</ZStack>
