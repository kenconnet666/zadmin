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
	import { AsyncCollectionQuery } from '@zadmin/zui/runtime';

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
	let value = $state<SelectionKey | undefined>('prod');
	const query = new AsyncCollectionQuery<string, readonly ZComboboxOption[]>(
		async (kind, context) => {
			if (kind === 'loading')
				return new Promise<readonly ZComboboxOption[]>((_, reject) => {
					const abort = () => {
						context.signal.removeEventListener('abort', abort);
						reject(context.signal.reason ?? new Error('Remote query aborted.'));
					};
					if (context.signal.aborted) abort();
					else context.signal.addEventListener('abort', abort, { once: true });
				});
			if (kind === 'empty') return [];
			if (kind === 'error') throw new Error('服务端暂时不可用');
			return allOptions.filter((option) => kind === 'orphan' || option.value !== 'prod');
		}
	);
	let queryState = $state(query.state);
	const unsubscribe = query.subscribe((state) => (queryState = state));
	$effect(() => () => {
		unsubscribe();
		query.dispose();
	});
	let options = $derived(queryState.data ?? allOptions);
	let loading = $derived(queryState.loading);
</script>

<ZStack gap="medium">
	<ZStack direction="row" gap="small" wrap>
		<ZButton type="button" variant="secondary" onclick={() => void query.load('loading')}
			>进入远程加载
		</ZButton>
		<ZButton type="button" variant="secondary" onclick={() => void query.load('empty')}
			>返回空结果
		</ZButton>
		<ZButton type="button" variant="secondary" onclick={() => void query.load('orphan')}
			>返回不含当前值的结果
		</ZButton>
		<ZButton type="button" variant="secondary" onclick={() => void query.load('error')}
			>模拟错误</ZButton
		>
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
		value = {String(value)} · input = {inputValue} · status = {queryState.status} · 当前结果 = {options.length}
	</ZText>
	{#if queryState.error}<ZText tone="danger">{String(queryState.error)}</ZText>{/if}
</ZStack>
