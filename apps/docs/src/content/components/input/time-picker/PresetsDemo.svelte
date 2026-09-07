<script lang="ts">
	import { Time } from '@internationalized/date';
	import { ZTimePicker, ZStack, ZText } from '@zadmin/zui';
	let value = $state<Time | null>(new Time(9));
	let changes = $state(0);
</script>

<ZStack gap="medium">
	<ZTimePicker
		aria-label="上海提醒时间"
		bind:value
		hourCycle={24}
		showNow
		timeZone="Asia/Shanghai"
		presets={[
			{ label: '上午九点', value: new Time(9) },
			{ label: '下午三点', value: () => new Time(15) }
		]}
		onValueChange={() => {
			changes += 1;
		}}
	/>
	<ZText tone="muted">时间={value?.toString() ?? '空'} · 用户变更={changes}</ZText>
	<ZText tone="muted"
		>“现在”在点击时读取上海时区时间；预设也在操作时重新检查可用性。两者先更新面板草稿，确认后才修改字段。</ZText
	>
</ZStack>
