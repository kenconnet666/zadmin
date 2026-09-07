<script lang="ts">
	import {
		CalendarDateTime,
		parseZonedDateTime,
		type ZonedDateTime
	} from '@internationalized/date';
	import { ZDateTimeRangePicker, ZStack, ZText } from '@zadmin/zui';
	let range = $state<{ start: ZonedDateTime | null; end: ZonedDateTime | null } | null>({
		start: parseZonedDateTime('2026-11-01T00:30-04:00[America/New_York]'),
		end: parseZonedDateTime('2026-11-01T02:30-05:00[America/New_York]')
	});
</script>

<ZStack gap="medium">
	<ZDateTimeRangePicker
		aria-label="上海显示的纽约维护窗口"
		mode="zoned"
		bind:value={range}
		timeZone="Asia/Shanghai"
		hourCycle={24}
	/>
	<ZText tone="muted"
		>{range?.start?.toString() ?? '空'} → {range?.end?.toString() ??
			'空'}。显示时区改变不会改写两个端点所属时区。</ZText
	>
	<ZDateTimeRangePicker
		aria-label="仅已知开始时刻"
		allowEmpty
		hourCycle={24}
		defaultValue={{ start: new CalendarDateTime(2026, 9, 7, 9), end: null }}
	/>
	<ZDateTimeRangePicker
		aria-label="显式自动排序"
		order="swap"
		hourCycle={24}
		defaultValue={{
			start: new CalendarDateTime(2026, 9, 7, 9),
			end: new CalendarDateTime(2026, 9, 7, 17)
		}}
	/>
	<ZText tone="muted"
		>strict 保留顺序并拒绝倒置完整范围；swap 仅排序即将提交的完整用户候选。allowEmpty
		允许部分范围，外部值始终由调用方拥有。</ZText
	>
</ZStack>
