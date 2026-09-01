<script lang="ts">
	import {
		ZButton,
		ZField,
		ZRadioGroup,
		ZStack,
		ZText,
		type SelectionKey,
		type ZRadioGroupOption
	} from '@zadmin/zui';

	let value = $state<SelectionKey | undefined>(1);
	let changes = $state(0);
	let submitted = $state('尚未读取');
	const options = [
		{ label: '数字 1', value: 1 },
		{ label: '字符串 1', value: '1' },
		{ disabled: true, label: '冻结方案', value: 'legacy' }
	] satisfies readonly ZRadioGroupOption[];

	function submit(event: SubmitEvent): void {
		event.preventDefault();
		submitted =
			new FormData(event.currentTarget as HTMLFormElement).get('tier')?.toString() ?? '无值';
	}
</script>

<form onsubmit={submit}>
	<ZStack gap="medium">
		<ZField
			description="数字1与字符串1是两个LogicalCollection key；FormData按HTML合同序列化为字符串。"
			label="数据化方案"
			name="tier"
			required
		>
			<ZRadioGroup
				bind:value
				data-testid="radio-group-options"
				defaultValue={1}
				onValueChange={() => (changes += 1)}
				{options}
				orientation="horizontal"
			/>
		</ZField>
		<ZStack direction="row" gap="small" wrap>
			<ZButton size="small" type="submit">读取FormData</ZButton>
			<ZButton size="small" type="reset" variant="secondary">重置</ZButton>
		</ZStack>
		<ZText tone="muted"
			>value = {String(value)} ({typeof value}) · 用户变更 = {changes} · FormData = {submitted}</ZText
		>
	</ZStack>
</form>
