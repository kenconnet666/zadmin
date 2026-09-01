<script lang="ts">
	import {
		ZStack,
		ZText,
		ZTooltip,
		ZTooltipContent,
		ZTooltipGroup,
		ZTooltipTrigger
	} from '@zadmin/zui';
</script>

<ZTooltipGroup delay={350} skipDelayDuration={500}>
	<ZStack align="center" direction="row" gap="medium" wrap>
		{#each ['构建', '发布', '回滚'] as action (action)}
			<ZTooltip>
				<ZTooltipTrigger variant="secondary">{action}</ZTooltipTrigger>
				<ZTooltipContent>{action}操作说明</ZTooltipContent>
			</ZTooltip>
		{/each}
	</ZStack>
</ZTooltipGroup>
<ZText tone="muted">首次hover等待350ms；500ms cooldown内切换会即时显示，组内只打开一个。</ZText>
