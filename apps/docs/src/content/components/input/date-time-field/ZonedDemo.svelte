<script lang="ts">
	import { parseZonedDateTime, type ZonedDateTime } from '@internationalized/date';
	import { ZDateTimeField, ZStack, ZText } from '@zadmin/zui';
	let value = $state<ZonedDateTime | null>(
		parseZonedDateTime('2026-11-01T01:30-04:00[America/New_York]')
	);
</script>

<ZStack gap="medium">
	<ZDateTimeField
		aria-label="纽约会议时间"
		mode="zoned"
		timeZone="America/New_York"
		disambiguation="reject"
		bind:value
		hourCycle={24}
	/>
	<ZDateTimeField
		aria-label="同一会议的上海时间"
		mode="zoned"
		timeZone="Asia/Shanghai"
		bind:value
		hourCycle={24}
	/>
	<ZText tone="muted">{value?.toString() ?? '空'}</ZText>
	<ZText tone="muted"
		>两处显示同一时刻。编辑上海时间仍保留值的纽约时区；纽约字段用 reject
		拒绝夏令时中不存在或有歧义的本地输入。</ZText
	>
</ZStack>
