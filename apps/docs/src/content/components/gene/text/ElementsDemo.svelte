<script lang="ts">
	import { ZStack, ZText } from '@zadmin/zui';
</script>

<ZStack gap="small">
	<ZText as="p">段落使用真实p元素并保留默认语义。</ZText>
	<ZText as="strong" size="xlarge">强调文本</ZText>
	<ZText as="small" tone="muted">辅助说明使用small元素。</ZText>
	<ZText as="label" weight="semibold">表单标签文本</ZText>
</ZStack>
