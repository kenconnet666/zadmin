<script lang="ts">
	import {
		ZPeriodPicker,
		ZStack,
		ZText,
		monthPeriod,
		quarterPeriod,
		serializePeriod,
		type MonthPeriod,
		type PeriodRangeValue
	} from '@zadmin/zui';
	let months = $state<readonly MonthPeriod[]>([monthPeriod(2026, 9), monthPeriod(2026, 7)]);
	let range = $state<PeriodRangeValue<'quarter'> | null>({
		start: quarterPeriod(2026, 1, 4),
		end: quarterPeriod(2026, 4, 4)
	});
	let commits = $state(0);
</script>

<ZStack gap="medium">
	<ZPeriodPicker
		granularity="month"
		selectionMode="multiple"
		bind:value={months}
		pickerLabel="多个报表月份"
	/>
	<ZText tone="muted">月份顺序：{months.map(serializePeriod).join(' · ') || '空'}</ZText>
	<ZPeriodPicker
		granularity="quarter"
		selectionMode="range"
		bind:value={range}
		fiscalYearStartMonth={4}
		commitMode="confirm"
		onCommit={() => {
			commits += 1;
		}}
		pickerLabel="财政季度范围"
	/>
	<ZText tone="muted"
		>{range?.start ? serializePeriod(range.start) : '空'} → {range?.end
			? serializePeriod(range.end)
			: '空'} · commit={commits}</ZText
	>
	<ZText tone="muted"
		>多选保持面板打开；确认模式支持反复修改和取消。机器序列化保留财年规则，按钮显示保持简洁。</ZText
	>
</ZStack>
