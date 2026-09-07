<script lang="ts">
	import {
		ZPeriodPicker,
		ZStack,
		ZText,
		monthPeriod,
		yearPeriod,
		quarterPeriod,
		weekPeriod
	} from '@zadmin/zui';
</script>

<ZStack gap="medium">
	<ZPeriodPicker granularity="month" defaultValue={monthPeriod(2026, 9)} pickerLabel="选择月份" />
	<ZPeriodPicker granularity="year" defaultValue={yearPeriod(2026)} pickerLabel="选择年份" />
	<ZPeriodPicker
		granularity="quarter"
		defaultValue={quarterPeriod(2026, 3)}
		pickerLabel="选择季度"
	/>
	<ZPeriodPicker
		granularity="week"
		defaultValue={weekPeriod(2026, 37)}
		pickerLabel="选择ISO周"
		showWeekNumbers
	/>
	<ZText tone="muted"
		>相同Picker API通过granularity选择不同周期，默认即时选择并关闭；方向键也能打开面板。</ZText
	>
</ZStack>
