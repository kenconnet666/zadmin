<script lang="ts">
	import {
		ZButton,
		ZSelect,
		ZSelectContent,
		ZSelectTrigger,
		ZStack,
		ZText,
		type SelectionKey,
		type ZSelectOption
	} from '@zadmin/zui';

	const labels: Readonly<Record<string, string>> = {
		dev: '开发环境',
		prod: '生产环境',
		staging: '预发环境'
	};
	const allOptions: readonly ZSelectOption[] = [
		{ label: labels.dev, value: 'dev' },
		{ label: labels.staging, value: 'staging' },
		{ label: labels.prod, value: 'prod' }
	];
	let options = $state<readonly ZSelectOption[]>(allOptions);
	let loading = $state(false);
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
				options = allOptions.filter((option) => option.value !== 'prod');
			}}
			>返回不含当前值的结果
		</ZButton>
		<ZButton
			type="button"
			variant="secondary"
			onclick={() => {
				loading = false;
				options = allOptions;
			}}
			>恢复完整结果
		</ZButton>
	</ZStack>
	<ZSelect bind:value {loading} {options} valueLabel={(key) => labels[String(key)] ?? String(key)}>
		<ZSelectTrigger aria-label="异步部署环境" />
		<ZSelectContent />
	</ZSelect>
	<ZText tone="muted">
		value = {String(value)} · 当前结果 = {options.length} · 孤儿值仍显示为 {value === undefined
			? '—'
			: labels[String(value)]}
	</ZText>
</ZStack>
