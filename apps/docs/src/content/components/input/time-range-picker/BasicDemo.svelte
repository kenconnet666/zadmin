<script lang="ts">
	import { Time } from '@internationalized/date';
	import { ZTimeRangePicker, ZStack, ZText, type TimeRangeValue } from '@zadmin/zui';
	let value = $state<TimeRangeValue | null>({ start: new Time(9), end: new Time(17, 30) });
	let commits = $state(0);
</script>

<ZStack gap="medium">
	<ZTimeRangePicker
		aria-label="工作时间"
		bind:value
		hourCycle={24}
		onCommit={() => {
			commits += 1;
		}}
		presets={[
			{ label: '上午', value: { start: new Time(9), end: new Time(12) } },
			{ label: '下午', value: () => ({ start: new Time(13, 30), end: new Time(17, 30) }) }
		]}
	/>
	<ZText tone="muted"
		>{value?.start?.toString() ?? '空'} → {value?.end?.toString() ?? '空'} · 确认次数={commits}</ZText
	>
	<ZText tone="muted"
		>面板列、预设均先进入范围草稿，确认后提交；取消或 Escape 放弃本次面板编辑。</ZText
	>
</ZStack>
