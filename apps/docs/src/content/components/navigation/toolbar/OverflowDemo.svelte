<script lang="ts">
	import {
		ZButton,
		ZOverflowList,
		ZPopover,
		ZPopoverContent,
		ZPopoverTrigger,
		ZStack,
		ZText,
		ZToolbar,
		ZToolbarItem
	} from '@zadmin/zui';

	const items = [
		{ key: 'save', label: '保存' },
		{ key: 'share', label: '分享' },
		{ key: 'duplicate', label: '复制' },
		{ key: 'archive', label: '归档' },
		{ key: 'delete', label: '删除' }
	] as const;
	let open = $state(false);
	let width = $state(240);
	let action = $state('尚未操作');
	function activate(label: string): void {
		action = label;
		open = false;
	}
</script>

<ZStack gap="small">
	<ZText weight="semibold">窄宽度下的Toolbar命令</ZText>
	<ZStack direction="row" gap="small" wrap>
		<ZButton size="small" variant="outline" onclick={() => (width = 240)}>收紧 240px</ZButton>
		<ZButton size="small" variant="outline" onclick={() => (width = 390)}>展开 390px</ZButton>
	</ZStack>
	<ZToolbar aria-label="文件命令" gap="small">
		<ZOverflowList
			{items}
			itemKey={(item) => item.key}
			style={`width: ${width}px; max-width: 100%;`}
			suspended={open}
		>
			{#snippet item(item)}
				<ZToolbarItem value={item.key}>
					{#snippet children(props)}
						<ZButton {...props} variant="outline" onclick={() => activate(item.label)}
							>{item.label}</ZButton
						>
					{/snippet}
				</ZToolbarItem>
			{/snippet}
			{#snippet overflow(state)}
				<ZToolbarItem value="overflow">
					{#snippet children(props)}
						<ZPopover bind:open placement="bottom-start">
							<ZPopoverTrigger {...props} variant="ghost" aria-label="更多命令"
								>更多</ZPopoverTrigger
							>
							<ZPopoverContent>
								<ZStack gap="small">
									{#each state.overflowItems as item (item.key)}
										<ZButton variant="ghost" onclick={() => activate(item.label)}
											>{item.label}</ZButton
										>
									{/each}
								</ZStack>
							</ZPopoverContent>
						</ZPopover>
					{/snippet}
				</ZToolbarItem>
			{/snippet}
		</ZOverflowList>
	</ZToolbar>
	<ZText role="status" tone="muted">最近操作：{action}</ZText>
</ZStack>
