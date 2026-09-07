<script lang="ts">
	import {
		ZPeriodCalendar,
		ZStack,
		ZText,
		quarterPeriod,
		weekPeriod,
		periodStart,
		periodEnd,
		type QuarterPeriod,
		type WeekPeriod
	} from '@zadmin/zui';
	let quarter = $state<QuarterPeriod | null>(quarterPeriod(2026, 4, 4));
	let week = $state<WeekPeriod | null>(
		weekPeriod(2026, 1, { firstDayOfWeek: 'sun', minimalDaysInFirstWeek: 1 })
	);
</script>

<ZStack gap="large">
	<ZPeriodCalendar
		granularity="quarter"
		bind:value={quarter}
		fiscalYearStartMonth={4}
		calendarLabel="四月开始的财年季度"
	/>
	<ZText tone="muted"
		>财年 2026 从 2026 年 4 月开始，Q4 跨入下一自然年：{quarter
			? `${periodStart(quarter)} — ${periodEnd(quarter)}`
			: '空'}。</ZText
	>
	<ZPeriodCalendar
		granularity="week"
		bind:value={week}
		weekRules={{ firstDayOfWeek: 'sun', minimalDaysInFirstWeek: 1 }}
		showWeekNumbers
		calendarLabel="周日起始的工作周"
	/>
	<ZText tone="muted"
		>周日开始、首周至少一天：{week
			? `${periodStart(week)} — ${periodEnd(week)}`
			: '空'}。规则保存在值中，locale 只改变显示。</ZText
	>
</ZStack>
