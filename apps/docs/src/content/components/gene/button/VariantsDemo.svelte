<script lang="ts">
	import { ZButton, ZStack, ZText } from '@zadmin/zui';

	const sizes = ['xsmall', 'small', 'medium', 'large', 'xlarge'] as const;
</script>

<ZStack gap="large">
	<ZStack direction="row" gap="medium" wrap>
		<ZButton variant="solid">Solid 实心</ZButton>
		<ZButton variant="outline">Outline 描边</ZButton>
		<ZButton variant="ghost">Ghost 轻量</ZButton>
	</ZStack>
	<ZStack align="center" direction="row" gap="small" wrap>
		{#each sizes as size (size)}
			<ZButton {size}>{size}</ZButton>
		{/each}
	</ZStack>
	<ZText size="small" tone="muted"
		>五档高度与文字比例分别控制；最大按钮沿用16px正文，避免把操作变成标题。</ZText
	>
</ZStack>
