<script lang="ts">
	import {
		ZButton,
		ZStack,
		ZText,
		ZTransfer,
		type SelectionKey,
		type TransferItem
	} from '@zadmin/zui';

	const firstPage: readonly TransferItem[] = [
		{ description: '当前页面', key: 'stable', label: '稳定集群' },
		{ description: '当前页面', key: 'candidate', label: '候选集群' }
	];
	const remotePage: readonly TransferItem[] = [
		{ description: '远程页面', key: 'remote-production', label: '远程生产集群' },
		{ description: '远程页面', key: 'remote-backup', label: '远程灾备集群' }
	];
	let items = $state<readonly TransferItem[]>(firstPage);
	let loading = $state(false);
	let value = $state<readonly SelectionKey[]>(['stable', 'remote-production']);
</script>

<ZStack gap="small">
	<ZStack direction="row" gap="small" wrap>
		<ZButton
			variant="secondary"
			onclick={() => {
				loading = true;
				items = [];
			}}>开始远程请求</ZButton
		>
		<ZButton
			variant="secondary"
			onclick={() => {
				items = remotePage;
				loading = false;
			}}>返回远程页面</ZButton
		>
		<ZButton
			variant="secondary"
			onclick={() => {
				items = firstPage;
				loading = false;
			}}>返回第一页</ZButton
		>
		<ZButton variant="secondary" onclick={() => (value = [])}>Owner清空</ZButton>
	</ZStack>
	<ZTransfer bind:value {items} {loading} name="cluster" />
	<ZText tone="muted" size="small">
		value = {value.join(', ') ||
			'[]'}。items分页、请求取消、缓存与竞态世代由业务数据层拥有；Transfer保留未加载key。
	</ZText>
</ZStack>
