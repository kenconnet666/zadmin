<script lang="ts">
	import { ZNativeSelect, ZText } from '@zadmin/zui';
	const items = [
		{ label: '北京', value: 'beijing' },
		{
			label: '华东',
			options: [
				{ label: '上海', value: 'shanghai' },
				{ label: '杭州', value: 'hangzhou' }
			]
		}
	] as const;
	let value = $state('beijing');
</script>

<ZNativeSelect aria-label="城市与地区" {items} bind:value size="medium" nativeSize={4} />
<ZText>选择值：{value}</ZText>
