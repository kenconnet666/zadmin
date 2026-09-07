<script lang="ts">
	import { CalendarDateTime } from '@internationalized/date';
	import { ZDateTimePicker, ZButton, ZGroup, ZStack, ZText } from '@zadmin/zui';
	let value = $state<CalendarDateTime | null>(new CalendarDateTime(2026, 9, 7, 10, 30, 15));
	let open = $state(false);
	let immediate = $state(false);
	let changes = $state(0);
	let commits = $state(0);
</script>

<ZStack gap="medium">
	<ZDateTimePicker
		aria-label="计划发布时刻"
		bind:value
		bind:open
		granularity="second"
		hourCycle={24}
		commitMode={immediate ? 'immediate' : 'confirm'}
		onValueChange={() => {
			changes += 1;
		}}
		onCommit={() => {
			commits += 1;
		}}
	/>
	<ZGroup gap="small" wrap>
		<ZButton
			variant="outline"
			onclick={() => {
				immediate = !immediate;
			}}>面板模式：{immediate ? '即时写入' : '确认后写入'}</ZButton
		>
		<ZButton
			variant="outline"
			onclick={() => {
				value = null;
			}}>外部清空</ZButton
		>
	</ZGroup>
	<ZText tone="muted"
		>{value?.toString() ?? '空'} · value 变更={changes} · commit={commits} · open={open}</ZText
	>
	<ZText tone="muted"
		>字段完整输入持续更新值。面板模式决定选日期和时间时是否立即写入；确认会提交并关闭，取消放弃尚未写入的面板草稿。</ZText
	>
</ZStack>
