<script lang="ts">
	import { ZStack, ZText } from '@zadmin/zui';
	import { ZCode } from '@zadmin/zui/code';

	const source = `const plan = ['validate', 'deploy', 'observe'];
for (const step of plan) {
  await run(step);
}
console.info('ready');`;
</script>

<ZStack gap="medium">
	<ZCode
		ariaLabel="带行号和重点行的发布脚本"
		code={source}
		highlightedLines={[2, 4]}
		lang="typescript"
		lineNumbers
		wrap
	/>
	<ZText tone="muted">行号不进入可访问名称；重点行仍保留完整可选择文本。</ZText>
</ZStack>
