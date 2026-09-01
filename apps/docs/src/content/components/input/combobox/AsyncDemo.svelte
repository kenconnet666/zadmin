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

	const labels: Readonly<Record<string, string>> = {
		dev: '开发环境',
		prod: '生产环境',
		staging: '预发环境'
	};
	const allOptions: readonly ZComboboxOption[] = [
		{ label: labels.dev, value: 'dev' },
		{ label: labels.staging, value: 'staging' },
		{ label: labels.prod, value: 'prod' }
	];
	let inputValue = $state('生产环境');
	let loading = $state(false);
	let options = $state<readonly ZComboboxOption[]>(allOptions);
	let value = $state<SelectionKey | undefined>('prod');
</script>

<ZStack gap="medium">
	<ZStack direction="row" gap="small" wrap>
		<ZButton
			type="button"
			variant="secondary"
			onclick={() => {
				loading = true;
				options = [];
			}}
			>进入远程加载
		</ZButton>
		<ZButton
			type="button"
			variant="secondary"
			onclick={() => {
				loading = false;
				options = [];
			}}
			>返回空结果
		</ZButton>
		<ZButton
			type="button"
			variant="secondary"
			onclick={() => {
				loading = false;
				options = allOptions.filter((option) => option.value !== 'prod');
			}}
			>返回不含当前值的结果
		</ZButton>
	</ZStack>
	<ZCombobox
		bind:inputValue
		bind:value
		{loading}
		{options}
		shouldFilter={false}
		valueLabel={(key) => labels[String(key)] ?? String(key)}
	>
		<ZComboboxInput aria-label="远程环境搜索" placeholder="服务端搜索" />
		<ZComboboxContent aria-label="远程环境结果" />
	</ZCombobox>
	<ZText tone="muted">
		value = {String(value)} · input = {inputValue} · 当前结果 = {options.length}
	</ZText>
</ZStack>
