<script lang="ts">
	import AlignCenter from '@lucide/svelte/icons/align-center';
	import AlignLeft from '@lucide/svelte/icons/align-left';
	import { ZStack, ZToggleButton } from '@zadmin/zui';
</script>

<ZStack align="center" direction="row" gap="medium" wrap>
	<ZToggleButton size="small">
		{#snippet start()}<AlignLeft aria-hidden="true" size={14} />{/snippet}左对齐
	</ZToggleButton>
	<ZToggleButton defaultPressed size="large">
		{#snippet start()}<AlignCenter aria-hidden="true" size={18} />{/snippet}居中
	</ZToggleButton>
	<ZToggleButton disabled fullWidth>禁用的整行切换</ZToggleButton>
</ZStack>
