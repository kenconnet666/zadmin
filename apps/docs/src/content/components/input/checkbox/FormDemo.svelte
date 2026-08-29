<script lang="ts">
	import { ZButton, ZCheckbox, ZStack, ZText, type CheckboxState } from '@zadmin/zui';

	let checked = $state<CheckboxState>('indeterminate');
	let changes = $state(0);
	let submitted = $state('尚未提交');

	function submit(event: SubmitEvent): void {
		event.preventDefault();
		const form = event.currentTarget as HTMLFormElement;
		submitted = new FormData(form).get('reports')?.toString() ?? '未选中';
	}
</script>

<form onreset={() => (submitted = '尚未提交')} onsubmit={submit}>
	<ZStack gap="medium">
		<label>
			<ZCheckbox
				bind:checked
				data-testid="checkbox-reports"
				defaultChecked="indeterminate"
				name="reports"
				onCheckedChange={() => (changes += 1)}
				value="weekly"
			/>
			接收每周报告
		</label>
		<ZStack direction="row" gap="small" wrap>
			<ZButton size="small" type="submit">读取FormData</ZButton>
			<ZButton size="small" type="reset" variant="secondary">重置</ZButton>
		</ZStack>
		<ZText tone="muted">state = {checked} · 用户变更次数 = {changes} · {submitted}</ZText>
	</ZStack>
</form>
