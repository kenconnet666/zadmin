<script lang="ts">
	import { ZCopyButton, ZStack, ZText } from '@zadmin/zui';

	let result = $state('尚未尝试复制');
</script>

<ZStack gap="small">
	<ZCopyButton
		value="https://zadmin.example/docs/copy-button"
		onCopy={(value) => (result = `写入成功：${value}`)}
		onCopyError={() => (result = '写入失败：浏览器拒绝或Clipboard不可用')}
	/>
	<ZText tone="muted">{result}</ZText>
</ZStack>
