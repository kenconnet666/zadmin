<script lang="ts">
	import { ZButton, ZCarousel, ZHeading, ZStack, ZText, type SelectionKey } from '@zadmin/zui';

	const items = [
		{ key: 1, label: '数字键一', copy: 'number 1 保持独立身份。' },
		{ key: '1', label: '字符串键一', copy: 'string 1 不会与数字键碰撞。' },
		{ key: 'final', label: '最终检查', copy: '调用方持有受控value。' }
	];
	let value = $state<SelectionKey>(1);
	let changes = $state(0);
</script>

<ZStack gap="medium">
	<ZStack direction="row" gap="small" wrap>
		<ZButton size="small" variant="secondary" onclick={() => (value = 1)}>owner写number 1</ZButton>
		<ZButton size="small" variant="secondary" onclick={() => (value = '1')}>owner写string 1</ZButton
		>
	</ZStack>
	<ZCarousel
		aria-label="受控typed key轮播"
		{items}
		itemKey={(entry) => entry.key}
		itemLabel={(entry) => entry.label}
		onValueChange={() => (changes += 1)}
		bind:value
	>
		{#snippet item(entry)}
			<ZHeading level={4}>{entry.label}</ZHeading>
			<ZText>{entry.copy}</ZText>
		{/snippet}
	</ZCarousel>
	<ZText tone="muted">value = {typeof value}:{String(value)} · 用户变更次数 = {changes}</ZText>
</ZStack>
