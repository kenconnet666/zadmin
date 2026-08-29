<script lang="ts">
	import { ZStack, ZText } from '@zadmin/zui';
	import { ZCode } from '@zadmin/zui/code';

	const closeScript = '</' + 'script>';
	const source = `<script lang="ts">
  import { ZButton } from '@zadmin/zui';
  let count = $state(0);
${closeScript}

<ZButton onclick={() => count += 1}>
  count = {count}
</ZButton>`;
</script>

<ZStack gap="medium">
	<ZText tone="muted">高亮器按需加载；加载前和SSR阶段保持可复制的纯文本源码。</ZText>
	<ZCode
		ariaLabel="Svelte按钮示例"
		code={source}
		lang="svelte"
		lineNumbers
		highlightedLines={[2, 6]}
	/>
</ZStack>
