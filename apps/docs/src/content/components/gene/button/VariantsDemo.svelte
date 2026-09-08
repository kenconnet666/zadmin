<script lang="ts">
	import { ZButton, ZStack, ZText } from '@zadmin/zui';
</script>

<ZStack gap="large">
	<ZStack direction="row" gap="medium" wrap>
		<ZButton variant="solid">Solid 实心</ZButton>
		<ZButton variant="outline">Outline 描边</ZButton>
		<ZButton variant="ghost">Ghost 轻量</ZButton>
	</ZStack>
	<ZText size="small" tone="muted"
		>variant只表达视觉强调层级；尺寸矩阵见“尺寸与状态”示例，避免把两个视觉轴混在一起。</ZText
	>
</ZStack>
