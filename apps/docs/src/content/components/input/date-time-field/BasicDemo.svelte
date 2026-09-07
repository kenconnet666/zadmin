<script lang="ts">
	import { CalendarDateTime } from '@internationalized/date';
	import { ZDateTimeField, ZButton, ZGroup, ZStack, ZText } from '@zadmin/zui';
	let value = $state<CalendarDateTime | null>(new CalendarDateTime(2026, 9, 7, 10, 30, 15));
	let changes = $state(0);
</script>

<ZStack gap="medium">
	<ZDateTimeField
		aria-label="计划发布时间"
		bind:value
		granularity="second"
		hourCycle={24}
		onValueChange={() => {
			changes += 1;
		}}
	/>
	<ZGroup gap="small" wrap>
		<ZButton
			variant="outline"
			onclick={() => {
				value = null;
			}}>外部清空</ZButton
		>
		<ZButton
			variant="outline"
			onclick={() => {
				value = new CalendarDateTime(2026, 9, 8, 9);
			}}>安排到明早</ZButton
		>
	</ZGroup>
	<ZText tone="muted">值={value?.toString() ?? '空'} · 用户变更={changes}</ZText>
	<ZText tone="muted"
		>先完成日期与时间再更新组合值；方向键可跨字段移动，Escape 撤销整个日期时间草稿。</ZText
	>
</ZStack>
