<script lang="ts">
	import { CalendarDate, createCalendar } from '@internationalized/date';
	import {
		ZButton,
		ZCalendar,
		ZMiniCalendar,
		ZStack,
		ZText,
		type CalendarCellContext
	} from '@zadmin/zui';

	let displayLocale = $state('he-IL-u-ca-hebrew');
	let gregorian = $state<CalendarDate | null>(new CalendarDate(2024, 4, 8));
	let hebrew = $state<CalendarDate | null>(
		new CalendarDate(createCalendar('hebrew'), 5784, 13, 29)
	);
	let japanese = $state<CalendarDate | null>(
		new CalendarDate(createCalendar('japanese'), 'heisei', 31, 4, 30)
	);

	function owner(value: CalendarDate | null): string {
		return value
			? `${value.calendar.identifier} · ${value.era} ${value.year}/${value.month}/${value.day}`
			: '空值（组件仍记住最近的owner calendar）';
	}
</script>

{#snippet dateCell(context: CalendarCellContext)}
	<span title={`${context.date.calendar.identifier} ${context.date.year}`}>
		{context.date.day}<small> {context.date.calendar.identifier}:{context.date.year}</small>
	</span>
{/snippet}

<ZStack gap="large">
	<ZStack gap="small">
		<ZText weight="semibold">Gregorian业务值，切换Hebrew / Persian显示历法</ZText>
		<ZStack direction="row" gap="small" wrap>
			<ZButton
				onclick={() => (displayLocale = 'he-IL-u-ca-hebrew')}
				size="small"
				variant={displayLocale.includes('hebrew') ? 'solid' : 'outline'}>Hebrew显示</ZButton
			>
			<ZButton
				onclick={() => (displayLocale = 'fa-IR-u-ca-persian')}
				size="small"
				variant={displayLocale.includes('persian') ? 'solid' : 'outline'}>Persian显示</ZButton
			>
		</ZStack>
		<ZCalendar
			bind:value={gregorian}
			calendarLabel="国际显示历法"
			{dateCell}
			dir="rtl"
			locale={displayLocale}
			timeZone="UTC"
		/>
		<ZText tone="muted">业务owner：{owner(gregorian)}</ZText>
	</ZStack>

	<ZStack gap="small">
		<ZText weight="semibold">Hebrew闰月13到新年1月</ZText>
		<ZCalendar
			bind:value={hebrew}
			calendarLabel="Hebrew闰月日期条"
			{dateCell}
			dir="rtl"
			locale="he-IL-u-ca-hebrew"
			timeZone="UTC"
			view="strip"
			visibleDays={7}
		/>
		<ZText tone="muted">业务owner：{owner(hebrew)}</ZText>
	</ZStack>

	<ZStack gap="small">
		<ZText weight="semibold">Japanese平成到令和，复用MiniCalendar façade</ZText>
		<ZMiniCalendar
			bind:value={japanese}
			calendarLabel="Japanese年号边界"
			{dateCell}
			locale="ja-JP-u-ca-japanese"
			timeZone="UTC"
		/>
		<ZText tone="muted">业务owner：{owner(japanese)}</ZText>
	</ZStack>
</ZStack>
