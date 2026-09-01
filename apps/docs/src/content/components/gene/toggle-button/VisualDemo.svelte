<script lang="ts">
	import { ZStack, ZText, ZToggleButton } from '@zadmin/zui';
</script>

<ZStack gap="medium">
	<ZStack direction="row" gap="small" wrap>
		<ZToggleButton defaultPressed variant="primary">Primary</ZToggleButton>
		<ZToggleButton defaultPressed variant="secondary">Secondary</ZToggleButton>
		<ZToggleButton defaultPressed variant="ghost">Ghost</ZToggleButton>
	</ZStack>
	<ZStack direction="row" gap="small" wrap>
		<ZToggleButton defaultPressed tone="danger" variant="primary">危险Primary</ZToggleButton>
		<ZToggleButton defaultPressed tone="danger" variant="secondary">危险Secondary</ZToggleButton>
		<ZToggleButton defaultPressed tone="danger" variant="ghost">危险Ghost</ZToggleButton>
	</ZStack>
	<ZText tone="muted"
		>Toggle复用Button的variant/tone矩阵，pressed只增加选中状态，不建立第二套颜色API。</ZText
	>
</ZStack>
