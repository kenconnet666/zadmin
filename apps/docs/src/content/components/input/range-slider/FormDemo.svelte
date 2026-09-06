<script lang="ts">
	import { ZButton, ZField, ZRangeSlider, ZStack, ZText, type SliderRangeValue } from '@zadmin/zui';

	let value = $state<SliderRangeValue>([25, 75]);
	let output = $state('尚未提交');

	function submit(event: SubmitEvent): void {
		event.preventDefault();
		const values = new FormData(event.currentTarget as HTMLFormElement).getAll('budget');
		output = values.map(String).join(', ');
	}
</script>

<form onreset={() => (output = '已重置')} onsubmit={submit}>
	<ZStack gap="medium">
		<ZField label="预算区间" name="budget" required>
			<ZRangeSlider
				bind:value
				defaultValue={[25, 75]}
				step={5}
				thumbLabels={['最低预算', '最高预算']}
			/>
		</ZField>
		<ZStack direction="row" gap="small" wrap>
			<ZButton size="small" type="submit">读取FormData</ZButton>
			<ZButton size="small" type="reset" variant="outline">重置</ZButton>
		</ZStack>
		<ZText tone="muted">value=[{value.join(', ')}] · FormData={output}</ZText>
	</ZStack>
</form>
