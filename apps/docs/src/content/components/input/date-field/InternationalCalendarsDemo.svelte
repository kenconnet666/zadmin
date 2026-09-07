<script lang="ts">
	import { CalendarDate, createCalendar } from '@internationalized/date';
	import { ZDateField, ZField, ZStack, ZText } from '@zadmin/zui';

	let japanese = $state<CalendarDate | null>(
		new CalendarDate(createCalendar('japanese'), 'reiwa', 8, 9, 7)
	);
	let hebrew = $state<CalendarDate | null>(new CalendarDate(createCalendar('hebrew'), 5784, 6, 15));
</script>

<ZStack gap="large">
	<ZStack gap="small">
		<ZField label="日本历发布日期">
			<ZDateField bind:value={japanese} locale="ja-JP-u-ca-japanese" timeZone="Asia/Tokyo" />
		</ZField>
		<ZText tone="muted"
			>owner = {japanese
				? `${japanese.calendar.identifier} / ${japanese.era} ${japanese.year}-${japanese.month}-${japanese.day}`
				: 'null'}；纪元年使用自然位数并在Enter或离开字段时提交，可选纪元遵循@internationalized/date当前从明治开始的边界。</ZText
		>
	</ZStack>

	<ZStack gap="small">
		<ZField label="希伯来历结算日">
			<ZDateField bind:value={hebrew} locale="en-US-u-ca-hebrew" timeZone="Asia/Jerusalem" />
		</ZField>
		<ZText tone="muted"
			>owner = {hebrew
				? `${hebrew.calendar.identifier} / ${hebrew.year}-${hebrew.month}-${hebrew.day}`
				: 'null'}；5784是包含13个月的闰年。</ZText
		>
	</ZStack>
</ZStack>
