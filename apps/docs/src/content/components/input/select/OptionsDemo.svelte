<script lang="ts">
	import {
		ZSelect,
		ZSelectContent,
		ZSelectTrigger,
		ZStack,
		ZText,
		type SelectionKey,
		type ZSelectOption
	} from '@zadmin/zui';

	const options = [
		{ group: '数字 key', label: '数字 1', value: 1 },
		{ group: '数字 key', label: '数字 2（禁用）', value: 2, disabled: true },
		{ group: '字符串 key', label: '字符串 "1"', value: '1' },
		{ group: '字符串 key', label: '字符串 "2"', value: '2' }
	] satisfies readonly ZSelectOption[];
	let value = $state<SelectionKey | undefined>(1);
</script>

<ZStack gap="medium">
	<ZSelect bind:value {options}>
		<ZSelectTrigger aria-label="选择typed key" />
		<ZSelectContent>
			{#snippet option(entry)}
				<ZStack direction="row" gap="small" justify="between">
					<span>{entry.label}</span>
					<ZText tone="muted">{typeof entry.value}</ZText>
				</ZStack>
			{/snippet}
		</ZSelectContent>
	</ZSelect>
	<ZText tone="muted">value = {String(value)} · typeof = {typeof value}</ZText>
</ZStack>
