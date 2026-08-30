<script lang="ts">
	import CircleAlert from '@lucide/svelte/icons/circle-alert';
	import Info from '@lucide/svelte/icons/info';
	import { ZResult, ZStack } from '@zadmin/zui';
</script>

<ZStack direction="row" gap="large" wrap>
	<ZResult headingLevel={4} title="等待审批" tone="info">
		{#snippet icon()}<Info aria-hidden="true" size={32} />{/snippet}
		审批完成后会自动继续发布。
	</ZResult>
	<ZResult headingLevel={4} title="无法继续" tone="danger">
		{#snippet icon()}<CircleAlert aria-hidden="true" size={32} />{/snippet}
		请修复阻断项后重新运行门禁。
	</ZResult>
</ZStack>
