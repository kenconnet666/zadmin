<script lang="ts">
	import {
		ZMultiSelect,
		ZMultiSelectContent,
		ZMultiSelectTrigger,
		ZStack,
		ZTag,
		ZText,
		type SelectionKey,
		type ZMultiSelectOption
	} from '@zadmin/zui';

	const options: readonly ZMultiSelectOption[] = [
		{ group: 'Typed key', label: '数字 1', value: 1 },
		{ group: 'Typed key', label: '字符串 "1"', value: '1' },
		{ group: '环境', label: '开发环境', value: 'development' },
		{ group: '环境', label: '生产环境', value: 'production' },
		{ disabled: true, group: '环境', label: '已归档环境', value: 'archived' }
	];
	let value = $state<readonly SelectionKey[]>([1, '1', 'production']);
	let changes = $state(0);
</script>

<ZStack gap="small">
	<ZMultiSelect bind:value clearable maxTagCount={2} {options} onValueChange={() => (changes += 1)}>
		<ZMultiSelectTrigger aria-label="选择typed key" />
		<ZMultiSelectContent>
			{#snippet groupLabel(group)}
				<ZText size="small" weight="semibold">{group}</ZText>
			{/snippet}
			{#snippet option(option)}
				<ZStack direction="row" gap="small">
					<span>{option.label}</span>
					<ZTag>{typeof option.value}</ZTag>
				</ZStack>
			{/snippet}
		</ZMultiSelectContent>
	</ZMultiSelect>
	<ZText tone="muted" size="small">
		value = {value.map((entry) => `${typeof entry}:${entry}`).join(' · ')} · 变更 = {changes}
	</ZText>
</ZStack>
