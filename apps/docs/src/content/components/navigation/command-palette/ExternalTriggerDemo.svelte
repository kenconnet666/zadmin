<script lang="ts">
	import { ZButton, ZCommandPalette, ZStack, ZText } from '@zadmin/zui';

	const items = [
		{ key: 'review', label: '打开代码审查' },
		{ key: 'terminal', label: '打开终端' }
	];
	let open = $state(false);
</script>

<ZStack gap="medium">
	<ZButton type="button" variant="secondary" onclick={() => (open = true)}>由业务按钮打开</ZButton>
	<ZCommandPalette
		bind:open
		inputLabel="搜索开发工具"
		{items}
		listLabel="开发工具"
		showTrigger={false}
		title="无内置Trigger的Palette"
	/>
	<ZText tone="muted">open = {open} · showTrigger = false</ZText>
</ZStack>
