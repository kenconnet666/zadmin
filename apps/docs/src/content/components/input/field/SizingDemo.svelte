<script lang="ts">
	import { ZStack, ZField, ZInput } from '@zadmin/zui';

	const sizes = ['xsmall', 'small', 'medium', 'large', 'xlarge'] as const;
</script>

<ZStack gap="large" align="start">
	{#each sizes as size (size)}
		<ZField label={`Field ${size}`} {size} description="尺寸同时控制间距并传递给内部输入。"
			><ZInput defaultValue="字段内容" /></ZField
		>
	{/each}
</ZStack>
