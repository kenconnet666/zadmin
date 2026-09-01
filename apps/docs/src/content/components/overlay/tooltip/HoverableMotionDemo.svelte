<script lang="ts">
	import {
		ZProvider,
		ZStack,
		ZText,
		ZTooltip,
		ZTooltipContent,
		ZTooltipTrigger
	} from '@zadmin/zui';
	let open = $state(false);
</script>

<ZProvider direction="rtl" motion="reduced">
	<ZStack gap="medium">
		<ZTooltip bind:open closeDelay={250} delay={0} hoverable placement="bottom-start">
			<ZTooltipTrigger variant="secondary">RTL与停留内容</ZTooltipTrigger>
			<ZTooltipContent>
				pointer可移入这段非交互说明以保持打开；任何按钮或链接仍会被运行时守卫拒绝。
			</ZTooltipContent>
		</ZTooltip>
		<ZText tone="muted">open = {open} · direction = rtl · motion = reduced</ZText>
	</ZStack>
</ZProvider>
