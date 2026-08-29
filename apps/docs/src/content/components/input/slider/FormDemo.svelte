<script lang="ts">
	import { ZButton, ZSlider, ZStack, ZText } from '@zadmin/zui';

	let value = $state(35);
	let changes = $state(0);
	let submitted = $state('尚未提交');

	function submit(event: SubmitEvent): void {
		event.preventDefault();
		const form = event.currentTarget as HTMLFormElement;
		submitted = new FormData(form).get('threshold')?.toString() ?? '无值';
	}
</script>

<form onreset={() => (submitted = '尚未提交')} onsubmit={submit}>
	<ZStack gap="medium">
		<label>
			告警阈值
			<ZSlider
				bind:value
				data-testid="slider-threshold"
				defaultValue={35}
				formatValue={(current) => `${current}%`}
				name="threshold"
				onValueChange={() => (changes += 1)}
				step={5}
			/>
		</label>
		<ZStack direction="row" gap="small" wrap>
			<ZButton size="small" type="submit">读取FormData</ZButton>
			<ZButton size="small" type="reset" variant="secondary">重置</ZButton>
		</ZStack>
		<ZText tone="muted">value = {value}% · 用户变更次数 = {changes} · {submitted}</ZText>
	</ZStack>
</form>
