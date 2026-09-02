<script lang="ts">
	import { ZInput, ZInputGroup, ZStack } from '@zadmin/zui';
</script>

<ZStack gap="medium">
	<ZInputGroup aria-label="小尺寸必填组合" required size="small">
		{#snippet prefix()}ID{/snippet}
		<ZInput aria-label="小尺寸值" />
	</ZInputGroup>
	<ZInputGroup aria-label="只读组合" readonly>
		{#snippet prefix()}env/{/snippet}
		<ZInput aria-label="只读值" value="production" />
	</ZInputGroup>
	<ZInputGroup aria-label="禁用且无效组合" disabled invalid size="large">
		<ZInput aria-label="禁用值" value="locked" />
	</ZInputGroup>
</ZStack>
