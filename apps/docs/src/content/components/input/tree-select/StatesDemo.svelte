<script lang="ts">
	import { ZStack, ZTreeSelect } from '@zadmin/zui';
	const nodes = [
		{ key: 'root', label: '全部服务' },
		{ key: 'api', label: 'API服务', parentKey: 'root' },
		{ key: 'worker', label: '任务服务', parentKey: 'root', disabled: true }
	];
</script>

<ZStack gap="medium">
	<ZTreeSelect
		aria-label="空的服务树选择"
		defaultExpandedKeys={['root']}
		{nodes}
		placeholder="选择服务"
	/>
	<ZTreeSelect aria-label="禁用的服务树选择" defaultValue="api" disabled {nodes} />
	<ZTreeSelect aria-label="只读的服务树选择" defaultValue="api" readonly {nodes} />
</ZStack>
