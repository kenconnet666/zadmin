<script lang="ts">
	import {
		CalendarDateTime,
		parseZonedDateTime,
		type ZonedDateTime
	} from '@internationalized/date';
	import { ZDateTimePicker, ZStack, ZText } from '@zadmin/zui';
	let appointment = $state<CalendarDateTime | null>(new CalendarDateTime(2026, 9, 7, 10, 30));
	let zoned = $state<ZonedDateTime | null>(
		parseZonedDateTime('2026-11-01T01:30-04:00[America/New_York]')
	);
</script>

<ZStack gap="medium">
	<ZDateTimePicker
		aria-label="受限预约时间"
		bind:value={appointment}
		hourCycle={24}
		minValue={new CalendarDateTime(2026, 9, 7, 10, 30)}
		maxValue={new CalendarDateTime(2026, 9, 10, 16)}
		isDateTimeUnavailable={(candidate) => candidate.hour < 9 || candidate.hour >= 18}
	/>
	<ZText tone="muted"
		>预约：{appointment?.toString() ?? '空'}。9 月 7 日最早 10:30，9 月 10 日最晚
		16:00，其余日期仅开放 09:00–18:00。</ZText
	>
	<ZDateTimePicker
		aria-label="纽约夏令时预约"
		mode="zoned"
		timeZone="America/New_York"
		disambiguation="reject"
		bind:value={zoned}
		hourCycle={24}
	/>
	<ZText tone="muted"
		>{zoned?.toString() ?? '空'}。reject
		会拒绝不存在或有歧义的本地时刻；选择新日期仍保留值所属时区。</ZText
	>
</ZStack>
