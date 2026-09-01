<script lang="ts">
	import {
		ZButton,
		ZMultiSelect,
		ZMultiSelectContent,
		ZMultiSelectTrigger,
		ZStack,
		ZText,
		type SelectionKey,
		type ZMultiSelectOption
	} from '@zadmin/zui';

	const firstPage: readonly ZMultiSelectOption[] = [
		{ label: '稳定版', value: 'stable' },
		{ label: '候选版', value: 'candidate' }
	];
	const secondPage: readonly ZMultiSelectOption[] = [
		{ label: '远程生产集群', value: 'remote-production' },
		{ label: '远程灾备集群', value: 'remote-backup' }
	];
	let options = $state<readonly ZMultiSelectOption[]>(firstPage);
	let value = $state<readonly SelectionKey[]>(['stable', 'remote-production']);
	let loading = $state(false);
</script>

<ZStack gap="small">
	<ZStack direction="row" gap="small" wrap>
		<ZButton
			variant="secondary"
			onclick={() => {
				loading = true;
				options = [];
			}}
			>开始远程查询
		</ZButton>
		<ZButton
			variant="secondary"
			onclick={() => {
				options = secondPage;
				loading = false;
			}}
			>返回下一页
		</ZButton>
		<ZButton
			variant="secondary"
			onclick={() => {
				options = [];
				loading = false;
			}}
			>空结果
		</ZButton>
	</ZStack>
	<ZMultiSelect
		bind:value
		{loading}
		{options}
		valueLabel={(key) => (key === 'remote-production' ? '远程生产集群（缓存）' : String(key))}
	>
		<ZMultiSelectTrigger aria-label="远程集群" />
		<ZMultiSelectContent />
	</ZMultiSelect>
	<ZText tone="muted" size="small">
		远程结果变化不会裁剪 value：{value.join(', ')}。请求、取消与竞态世代由业务数据层拥有。
	</ZText>
</ZStack>
