<script lang="ts">
	import { ZButton, ZStack, ZText, ZToggleGroup } from '@zadmin/zui';

	const items = [
		{ value: 1, label: '数字 1' },
		{ value: '1', label: '字符串 1' },
		{ value: 2, label: '数字 2' }
	] as const;
	let value = $state<readonly (typeof items)[number]['value'][]>([1]);
	let submitted = $state('尚未提交');

	function submit(event: SubmitEvent): void {
		event.preventDefault();
		const form = event.currentTarget as HTMLFormElement;
		submitted = [...new FormData(form).getAll('filter')].join(' | ') || '空';
	}
</script>

<form onsubmit={submit}>
	<ZStack gap="small">
		<ZToggleGroup
			bind:value
			defaultValue={[1]}
			{items}
			name="filter"
			selectionMode="multiple"
			aria-label="过滤条件"
		/>
		<ZStack direction="row" gap="small" wrap>
			<ZButton type="submit" size="small" variant="outline">读取FormData</ZButton>
			<ZButton type="reset" size="small" variant="ghost">原生reset</ZButton>
			<ZText tone="muted">typed value = [{value.join(', ')}]</ZText>
			<ZText tone="muted">提交值：{submitted}</ZText>
		</ZStack>
		<ZText tone="muted"
			>数字1与字符串1在typed value中不同；原生FormData序列化后都会成为文本“1”。</ZText
		>
	</ZStack>
</form>
