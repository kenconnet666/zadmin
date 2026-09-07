<script lang="ts">
	import { CalendarDateTime } from '@internationalized/date';
	import { ZDateTimeRangePicker, ZStack, ZText } from '@zadmin/zui';
	let value = $state<{ start: CalendarDateTime | null; end: CalendarDateTime | null } | null>({
		start: new CalendarDateTime(2026, 9, 7, 9),
		end: new CalendarDateTime(2026, 9, 7, 17, 30)
	});
	let commits = $state(0);
</script>

<ZStack gap="medium">
	<ZDateTimeRangePicker
		aria-label="维护窗口"
		bind:value
		hourCycle={24}
		onCommit={() => {
			commits += 1;
		}}
		presets={[
			{
				label: '上午维护',
				value: {
					start: new CalendarDateTime(2026, 9, 7, 9),
					end: new CalendarDateTime(2026, 9, 7, 12)
				}
			},
			{
				label: '跨日维护',
				value: () => ({
					start: new CalendarDateTime(2026, 9, 7, 23),
					end: new CalendarDateTime(2026, 9, 8, 1)
				})
			}
		]}
	/>
	<ZText tone="muted"
		>{value?.start?.toString() ?? '空'} → {value?.end?.toString() ?? '空'} · commit={commits}</ZText
	>
	<ZText tone="muted"
		>两个端点共享一个面板和根模型。预设先进入草稿，确认后提交；跨午夜由完整日期明确表达。</ZText
	>
</ZStack>
