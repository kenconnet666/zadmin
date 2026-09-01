<script lang="ts">
	import { ZStack, ZTransfer } from '@zadmin/zui';
	const items = [
		{ key: 'read', label: '读取' },
		{ key: 'write', label: '写入' },
		{ key: 'admin', label: '管理', disabled: true }
	];
</script>

<ZStack gap="large">
	<ZTransfer
		aria-label="不带筛选的权限转移"
		defaultValue={['read']}
		filterable={false}
		{items}
		sourceTitle="可用权限"
		targetTitle="已授予"
	/>
	<ZTransfer
		aria-label="禁用的权限转移"
		defaultValue={['read']}
		disabled
		{items}
		sourceTitle="可用权限"
		targetTitle="已授予"
	/>
	<ZTransfer
		aria-label="只读的权限转移"
		defaultValue={['read', 'write']}
		readonly
		{items}
		sourceTitle="可用权限"
		targetTitle="只读授权"
	/>
</ZStack>
