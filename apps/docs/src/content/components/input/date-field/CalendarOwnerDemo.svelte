<script lang="ts">
	import { CalendarDate, createCalendar } from '@internationalized/date';
	import { ZButton, ZDateField, ZField, ZGroup, ZStack, ZText } from '@zadmin/zui';

	let persian = $state<CalendarDate | null>(
		new CalendarDate(createCalendar('persian'), 1403, 1, 1)
	);
</script>

<ZStack gap="large">
	<ZField label="波斯历排期">
		<ZDateField bind:value={persian} locale="fa-IR-u-ca-persian" timeZone="Asia/Tehran" />
	</ZField>
	<ZGroup gap="small" wrap>
		<ZButton onclick={() => (persian = null)} variant="outline">清空业务值</ZButton>
		<ZButton onclick={() => (persian = new CalendarDate(createCalendar('persian'), 1403, 1, 1))}
			>恢复波斯历值</ZButton
		>
	</ZGroup>
	<ZText tone="muted"
		>owner = {persian
			? `${persian.calendar.identifier} / ${persian.era} ${persian.year}-${persian.month}-${persian.day}`
			: 'null'}。可见segment使用Persian数字并接受同一locale数字输入；清空后按↑，新值仍使用最近的Persian
		owner calendar。</ZText
	>
	<ZField label="ISO 8601日期字段">
		<ZDateField value={new CalendarDate(2026, 9, 7)} locale="en-GB-u-ca-iso8601" readonly />
	</ZField>
	<ZText tone="muted"
		>ISO 8601明确复用Gregorian日/月/年算法；周编号仍由Calendar组件的weekNumbering独立控制。</ZText
	>
	<ZText tone="muted"
		>当前@internationalized/date没有Chinese、Dangi、generic Islamic与Islamic
		RGSA日期算法；这些Unicode calendar locale会被明确拒绝，不会静默退回Gregorian。</ZText
	>
</ZStack>
