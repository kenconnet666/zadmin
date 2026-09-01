<script lang="ts">
	import {
		ZButton,
		ZCombobox,
		ZComboboxContent,
		ZComboboxInput,
		ZStack,
		ZText,
		type SelectionKey,
		type ZComboboxOption
	} from '@zadmin/zui';

	const options = [
		{ label: '开发环境', value: 'dev' },
		{ label: '预发环境', value: 'staging' },
		{ label: '生产环境', value: 'prod' }
	] satisfies readonly ZComboboxOption[];
	let inputValue = $state('生产环境');
	let open = $state(false);
	let value = $state<SelectionKey | undefined>('prod');
</script>

<ZStack gap="medium">
	<ZStack direction="row" gap="small" wrap>
		<ZButton type="button" variant="secondary" onclick={() => (open = !open)}>
			{open ? '外部关闭' : '外部打开'}
		</ZButton>
		<ZButton
			type="button"
			variant="secondary"
			onclick={() => {
				value = undefined;
				inputValue = '';
			}}
			>外部清空两个状态
		</ZButton>
	</ZStack>
	<ZCombobox bind:inputValue bind:open bind:value {options}>
		<ZComboboxInput aria-label="受控部署环境" placeholder="选择环境" />
		<ZComboboxContent aria-label="受控部署环境结果" />
	</ZCombobox>
	<ZText tone="muted">open = {open} · value = {String(value)} · input = {inputValue || '—'}</ZText>
</ZStack>
