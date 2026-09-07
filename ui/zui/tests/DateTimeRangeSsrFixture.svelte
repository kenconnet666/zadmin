<script lang="ts">
	import { CalendarDateTime } from '@internationalized/date';
	import ZDateTimeRangePicker, {
		type ZDateTimeRangePickerLocalProps
	} from '../src/components/input/ZDateTimeRangePicker.svelte';

	const props = {
		allowEmpty: true,
		'aria-label': 'Server window',
		defaultValue: { start: new CalendarDateTime(2026, 9, 7, 9, 30), end: null },
		mode: 'local',
		name: 'window'
	} satisfies ZDateTimeRangePickerLocalProps;
</script>

<ZDateTimeRangePicker {...props} />
