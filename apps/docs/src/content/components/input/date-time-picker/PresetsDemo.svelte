<script lang="ts">
	import { CalendarDateTime } from '@internationalized/date';
	import { ZDateTimePicker, ZStack, ZText } from '@zadmin/zui';
	let value = $state<CalendarDateTime | null>(null);
	let reads = $state(0);
</script>

<ZStack gap="medium">
	<ZDateTimePicker
		aria-label="快捷计划时间"
		bind:value
		hourCycle={24}
		showNow
		timeZone="Asia/Shanghai"
		placeholderValue={new CalendarDateTime(2026, 9, 7, 9)}
		presets={[
			{ label: '发布日早九点', value: new CalendarDateTime(2026, 9, 7, 9) },
			{
				label: '读取最新计划',
				value: () => {
					reads += 1;
					return new CalendarDateTime(2026, 9, 8, 15);
				}
			}
		]}
	/>
	<ZText tone="muted">{value?.toString() ?? '空'} · 惰性预设读取={reads}</ZText>
	<ZText tone="muted"
		>预设只在点击时读取，并按当次约束验证；“现在”使用上海时区，遵循相同的确认策略。</ZText
	>
</ZStack>
