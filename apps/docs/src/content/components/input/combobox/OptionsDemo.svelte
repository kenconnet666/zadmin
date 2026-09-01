<script lang="ts">
	import {
		ZCombobox,
		ZComboboxContent,
		ZComboboxInput,
		ZStack,
		ZText,
		type SelectionKey,
		type ZComboboxOption
	} from '@zadmin/zui';

	const options = [
		{ group: '数字 key', label: '数字 1', value: 1 },
		{ group: '数字 key', label: '数字 2（禁用）', value: 2, disabled: true },
		{ group: '字符串 key', label: '字符串 "1"', value: '1' },
		{ group: '字符串 key', label: '字符串 "2"', value: '2' }
	] satisfies readonly ZComboboxOption[];
	let inputValue = $state('');
	let value = $state<SelectionKey | undefined>();
</script>

<ZStack gap="medium">
	<ZCombobox bind:inputValue bind:value {options}>
		<ZComboboxInput aria-label="搜索typed key" placeholder="输入数字或字符串" />
		<ZComboboxContent>
			{#snippet option(entry)}
				<ZStack direction="row" gap="small" justify="between">
					<span>{entry.label}</span>
					<ZText tone="muted">{typeof entry.value}</ZText>
				</ZStack>
			{/snippet}
		</ZComboboxContent>
	</ZCombobox>
	<ZText tone="muted">
		value = {String(value)} · typeof = {typeof value} · input = {inputValue || '—'}
	</ZText>
</ZStack>
