<script lang="ts">
	import {
		ZButton,
		ZField,
		ZSegmented,
		ZStack,
		ZText,
		type SelectionKey,
		type ZSegmentedOption
	} from '@zadmin/zui';

	let value = $state<SelectionKey | undefined>(1);
	let changes = $state(0);
	let submitted = $state('尚未读取');
	const options = [
		{ label: '数字 1', value: 1 },
		{ label: '字符串 1', value: '1' },
		{ disabled: true, label: '冻结', value: 'legacy' }
	] satisfies readonly ZSegmentedOption[];

	function submit(event: SubmitEvent): void {
		event.preventDefault();
		submitted =
			new FormData(event.currentTarget as HTMLFormElement).get('mode')?.toString() ?? '无值';
	}
</script>

<form onsubmit={submit}>
	<ZStack gap="medium">
		<ZField
			description="Field拥有name/required；数字与字符串key保持独立，FormValueBridge负责提交。"
			label="展示模式"
			name="mode"
			required
		>
			<ZSegmented
				bind:value
				data-testid="segmented-options"
				defaultValue={1}
				onValueChange={() => (changes += 1)}
				{options}
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
