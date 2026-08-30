<script lang="ts">
	import Search from '@lucide/svelte/icons/search';
	import { ZCommandPalette, ZStack, ZText } from '@zadmin/zui';
	const items = [
		{ key: 'audit', label: '运行系统审计' },
		{ key: 'coverage', label: '查看覆盖率' }
	];
	let query = $state('审计');
</script>

<ZStack gap="medium">
	<ZCommandPalette
		bind:query
		{items}
		resetQueryOnClose={false}
		title="开发工具"
		triggerLabel="打开开发工具"
	>
		{#snippet trigger()}<Search aria-hidden="true" size={16} /> 打开开发工具{/snippet}
	</ZCommandPalette>
	<ZText tone="muted">关闭后仍保留 query = {query}</ZText>
</ZStack>
