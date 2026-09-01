<script lang="ts">
	import {
		ZButton,
		ZRadioGroup,
		ZStack,
		ZText,
		type SelectionKey,
		type ZRadioGroupOption
	} from '@zadmin/zui';

	const complete = [
		{ label: 'Alpha', value: 'a' },
		{ label: 'Beta', value: 'b' },
		{ disabled: true, label: 'Charlie', value: 'c' },
		{ label: 'Delta', value: 'd' }
	] satisfies readonly ZRadioGroupOption[];
	let options = $state<readonly ZRadioGroupOption[]>(complete);
	let value = $state<SelectionKey | undefined>('b');
	let changes = $state(0);
	let formValue = $state('b');
	let formRef = $state<HTMLFormElement | null>(null);

	function readForm(): void {
		formValue = formRef ? (new FormData(formRef).get('choice')?.toString() ?? '无值') : '无值';
	}
</script>

<form bind:this={formRef}>
	<ZStack gap="medium">
		<ZRadioGroup
			bind:value
			aria-label="动态选项"
			data-testid="radio-group-dynamic"
			defaultValue="b"
			name="choice"
			onValueChange={() => (changes += 1)}
			{options}
			orientation="horizontal"
		/>
		<ZStack direction="row" gap="small" wrap>
			<ZButton
				size="small"
				type="button"
				onclick={() => (options = complete.filter(({ value }) => value !== 'b'))}>移除Beta</ZButton
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
			>value = {value === undefined ? 'undefined' : String(value)} · 用户变更 = {changes} · FormData =
			{formValue}</ZText
		>
	</ZStack>
</form>
