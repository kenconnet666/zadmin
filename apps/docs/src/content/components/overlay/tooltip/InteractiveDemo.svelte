<script lang="ts">
	import { ZText, ZTooltip, ZTooltipContent, ZTooltipTrigger } from '@zadmin/zui';

	let open = $state(false);
	let changes = $state(0);
</script>

<ZTooltip bind:open closeDelay={80} delay={150} onOpenChange={() => (changes += 1)}>
	<ZTooltipTrigger data-testid="tooltip-trigger" variant="secondary">健康状态</ZTooltipTrigger>
	<ZTooltipContent data-testid="tooltip-content">所有生产探针均正常</ZTooltipContent>
</ZTooltip>
<ZText tone="muted">open = {open} · 用户变更次数 = {changes}</ZText>
