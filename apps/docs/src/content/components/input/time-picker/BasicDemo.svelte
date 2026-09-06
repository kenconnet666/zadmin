<script lang="ts">
	import { Time } from '@internationalized/date';
	import { ZButton, ZField, ZGroup, ZStack, ZText, ZTimePicker } from '@zadmin/zui';

	let open = $state(false);
	let value = $state<Time | null>(new Time(9, 30));
	let changes = $state(0);

	function handleValueChange(next: Time | null): void {
		value = next;
		changes += 1;
	}
</script>

<ZStack gap="medium">
	<ZField
		description="面板中的点击和空格只改草稿；列上按 Enter 或点击确认才提交，Escape 关闭并放弃草稿。"
		label="受控执行时间"
	>
		<ZTimePicker
			bind:open
			bind:value
			granularity="minute"
			onValueChange={handleValueChange}
			pickerLabel="选择执行时间"
		/>
	</ZField>
	<ZGroup gap="small" wrap>
		<ZButton type="button" onclick={() => (open = true)}>外部打开</ZButton>
		<ZButton type="button" variant="outline" onclick={() => (value = new Time(18, 30))}>
			外部写入 18:30
		</ZButton>
		<ZButton type="button" variant="ghost" onclick={() => (value = null)}>外部清空</ZButton>
	</ZGroup>
	<ZText tone="muted"
		>open = {String(open)} · value = {value?.toString() ?? 'null'} · onValueChange = {changes}
		次</ZText
	>
</ZStack>
