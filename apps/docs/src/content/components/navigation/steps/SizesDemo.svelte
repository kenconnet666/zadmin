<script lang="ts">
	import { ZStack, ZSteps, ZText, controlSizes } from '@zadmin/zui';
	const items = [
		{ key: 'one', title: '资料', status: 'complete' },
		{ key: 'two', title: '配置', loading: true },
		{ key: 'three', title: '确认', disabled: true, clickable: true }
	] as const;
</script>

<ZStack gap="large">
	{#each controlSizes as size (size)}
		<ZStack gap="small">
			<ZText size="small" tone="muted">{size}</ZText>
			<ZSteps {items} {size} currentKey="two" aria-label={`${size}加载状态流程`} />
		</ZStack>
	{/each}
</ZStack>
