<script lang="ts">
	import {
		ZButton,
		ZSegmented,
		ZStack,
		ZText,
		type SelectionKey,
		type ZSegmentedOption
	} from '@zadmin/zui';

	const complete = [
		{ label: '日', value: 'day' },
		{ label: '周', value: 'week' },
		{ disabled: true, label: '月', value: 'month' },
		{ label: '季度', value: 'quarter' }
	] satisfies readonly ZSegmentedOption[];
	let options = $state<readonly ZSegmentedOption[]>(complete);
	let value = $state<SelectionKey | undefined>('week');
	let changes = $state(0);
	let formValue = $state('week');
	let formRef = $state<HTMLFormElement | null>(null);

	function readForm(): void {
		formValue = formRef ? (new FormData(formRef).get('period')?.toString() ?? '无值') : '无值';
	}
</script>

<form bind:this={formRef}>
	<ZStack gap="medium">
		<ZSegmented
			bind:value
			aria-label="动态周期"
			data-testid="segmented-dynamic"
			defaultValue="week"
			name="period"
			onValueChange={() => (changes += 1)}
			{options}
		/>
		<ZStack direction="row" gap="small" wrap>
			<ZButton
				size="small"
				type="button"
				onclick={() => (options = complete.filter(({ value }) => value !== 'week'))}>移除周</ZButton
			>
			<ZButton size="small" type="button" variant="secondary" onclick={() => (options = complete)}
				>恢复options</ZButton
			>
			<ZButton size="small" type="button" variant="secondary" onclick={() => (value = undefined)}
				>Owner清空</ZButton
			>
			<ZButton size="small" type="button" variant="secondary" onclick={readForm}
				>读取FormData</ZButton
			>
		</ZStack>
		<ZText tone="muted"
			>value = {value === undefined ? 'undefined' : String(value)} · 用户变更 = {changes} · FormValue
			= {formValue}</ZText
		>
	</ZStack>
</form>
