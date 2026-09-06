<script lang="ts">
	import {
		ZCheckboxGroup,
		ZField,
		ZText,
		type SelectionKey,
		type ZCheckboxGroupOption
	} from '@zadmin/zui';

	const options = [
		{ label: '数字 1', value: 1 },
		{ label: '字符串 1', value: '1' },
		{ label: '稳定版', value: 'stable' }
	] satisfies readonly ZCheckboxGroupOption<SelectionKey>[];
	let value = $state<readonly SelectionKey[]>([1, 'stable']);
</script>

<ZField label="发布通道" description="数字1与字符串1保持不同typed identity。" name="channels">
	<ZCheckboxGroup bind:value {options} orientation="horizontal" />
</ZField>
<ZText tone="muted"
	>value={JSON.stringify(value)}；API保留键类型，原生FormData把数值与字符串都序列化为文本。</ZText
>
