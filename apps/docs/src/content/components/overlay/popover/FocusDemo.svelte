<script lang="ts">
	import { ZInput, ZPopover, ZPopoverContent, ZPopoverTrigger, ZStack, ZText } from '@zadmin/zui';
	let input: HTMLInputElement | null = $state(null);
</script>

<ZPopover placement="right-start">
	<ZPopoverTrigger variant="secondary">编辑备注</ZPopoverTrigger>
	<ZPopoverContent initialFocus={() => input}>
		<ZStack gap="medium"
			><ZText as="strong">部署备注</ZText><ZInput
				aria-label="部署备注"
				bind:ref={input}
				placeholder="打开后自动聚焦"
			/></ZStack
		>
	</ZPopoverContent>
</ZPopover>
