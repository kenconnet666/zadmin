<script lang="ts">
	import { ZSegmented, ZStack } from '@zadmin/zui';
	const options = [
		{ label: '概览', value: 'overview' },
		{ label: '指标', value: 'metrics' },
		{ label: '事件', value: 'events' }
	];
</script>

<ZStack direction="row" gap="large" wrap>
	<ZSegmented aria-label="垂直视图" defaultValue="overview" {options} orientation="vertical" />
	<ZSegmented aria-label="禁用视图" defaultValue="metrics" disabled {options} />
</ZStack>
