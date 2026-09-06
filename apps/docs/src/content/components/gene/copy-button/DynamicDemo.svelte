<script lang="ts">
	import { ZButton, ZCopyButton, ZStack, ZText } from '@zadmin/zui';

	let index = $state(0);
	let copied = $state('尚未复制');
	let instance = $state<{ reset(): void } | null>(null);
	const values = ['第一段业务文本', '第二段动态文本', '第三段更新后的文本'];
</script>

<ZStack gap="small">
	<ZText>当前 value：{values[index]}</ZText>
	<ZStack direction="row" gap="small" wrap>
		<ZButton size="small" variant="outline" onclick={() => (index = (index + 1) % values.length)}
			>切换value</ZButton
		>
		<ZCopyButton
			bind:this={instance}
			value={values[index]}
			timeout={0}
			onCopy={() => (copied = '当前文本已复制')}
			onCopyError={() => (copied = '当前文本复制失败')}
		/>
		<ZButton
			size="small"
			variant="ghost"
			onclick={() => {
				instance?.reset();
				copied = '外部状态已reset';
			}}>外部状态reset</ZButton
		>
	</ZStack>
	<ZText tone="muted"
		>{copied}；value变化会让组件清除旧反馈，timeout=0等待下一次value变化或组件reset。</ZText
	>
</ZStack>
