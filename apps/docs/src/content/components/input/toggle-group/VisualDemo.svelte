<script lang="ts">
	import { ZProvider, ZStack, ZText, ZToggleGroup } from '@zadmin/zui';

	const items = [
		{ value: 'first', label: '第一项' },
		{ value: 'second', label: '第二项' }
	] as const;
	const sizes = ['xsmall', 'small', 'medium', 'large', 'xlarge'] as const;
	const tones = ['primary', 'neutral', 'info', 'success', 'warning', 'danger'] as const;
	const variants = ['solid', 'outline', 'ghost'] as const;
	let value = $state<readonly (typeof items)[number]['value'][]>(['first']);
</script>

<ZStack gap="medium">
	<ZStack gap="small">
		<ZText weight="semibold">五档 size（固定 tone=primary、variant=outline）</ZText>
		{#each sizes as size (size)}
			<ZToggleGroup bind:value {items} {size} aria-label={`尺寸 ${size}`} />
		{/each}
	</ZStack>
	<ZStack gap="small">
		<ZText weight="semibold">六种 semantic tone（固定 size=medium、variant=outline）</ZText>
		{#each tones as tone (tone)}
			<ZToggleGroup bind:value {items} {tone} aria-label={`语义色 ${tone}`} />
		{/each}
	</ZStack>
	<ZStack gap="small">
		<ZText weight="semibold">三种 variant（固定 size=medium、tone=primary）</ZText>
		{#each variants as variant (variant)}
			<ZToggleGroup bind:value {items} {variant} aria-label={`外观 ${variant}`} />
		{/each}
	</ZStack>
	<ZProvider
		componentDefaults={{ toggleGroup: { size: 'large', tone: 'info', variant: 'outline' } }}
	>
		<ZStack gap="small">
			<ZText weight="semibold">Provider componentDefaults</ZText>
			<ZToggleGroup {items} aria-label="继承Provider默认值" />
			<ZToggleGroup
				{items}
				size="small"
				tone="danger"
				variant="solid"
				aria-label="显式覆盖Provider默认值"
			/>
			<ZText tone="muted">上方继承large/info/outline，下方显式覆盖为small/danger/solid。</ZText>
		</ZStack>
	</ZProvider>
	<ZText tone="muted"
		>当前数组 value：[{value.join(', ')}]；真实button的aria-pressed/data-state随切换更新。</ZText
	>
</ZStack>
