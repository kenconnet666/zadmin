<script lang="ts">
	import { CalendarDate, Time } from '@internationalized/date';
	import {
		ZCalendar,
		ZDateField,
		ZProvider,
		ZStack,
		ZTimeField,
		zhCNLocalePack
	} from '../src/entrypoints/index.js';

	const date = new CalendarDate(2026, 8, 18);
</script>

<ZProvider locale="zh-CN" localePack={zhCNLocalePack} timeZone="Asia/Shanghai">
	<ZStack gap="medium">
		<ZCalendar data-testid="localized-calendar" defaultFocusedValue={date} defaultValue={date} />
		<ZDateField data-testid="localized-date-field" defaultValue={date} />
		<ZTimeField
			data-testid="localized-time-field"
			defaultValue={new Time(13, 5, 9)}
			granularity="second"
		/>
	</ZStack>
</ZProvider>
