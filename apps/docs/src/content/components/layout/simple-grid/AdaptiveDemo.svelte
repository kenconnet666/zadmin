<script lang="ts">
	import { ZCard, ZSimpleGrid, ZText } from '@zadmin/zui';

	const metrics = [
		['今日活跃用户', '12,480'],
		['待处理审批', '28'],
		['异常任务', '3'],
		['本月交付', '96']
	] as const;
</script>

<ZSimpleGrid gap="large" minItemWidth="12rem">
	{#each metrics as [label, value] (label)}
		<ZCard>
			<ZText as="div" tone="muted">{label}</ZText>
			<ZText as="strong" size="large" weight="semibold">{value}</ZText>
		</ZCard>
	{/each}
</ZSimpleGrid>
