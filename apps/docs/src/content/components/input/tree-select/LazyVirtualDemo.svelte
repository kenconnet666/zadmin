<script lang="ts">
	import { ZStack, ZText, ZTreeSelect, type TreeLoadContext, type TreeNode } from '@zadmin/zui';

	let nodes = $state<readonly TreeNode<string>[]>([
		{ hasChildren: true, key: 'services', label: '服务目录' }
	]);
	let value = $state<string | null>(null);

	async function loadChildren(
		node: TreeNode<string>,
		{ signal }: TreeLoadContext<string>
	): Promise<void> {
		await Promise.resolve();
		if (signal.aborted) return;
		nodes = [
			...nodes,
			...Array.from({ length: 1000 }, (_, index) => ({
				key: `service-${index}`,
				label: `服务 ${index + 1}`,
				parentKey: node.key
			}))
		];
	}
</script>

<ZStack gap="medium">
	<ZTreeSelect
		aria-label="大型服务树选择"
		bind:value
		clearable
		defaultExpandedKeys={['services']}
		height={216}
		itemSize={36}
		{nodes}
		onLoadChildren={loadChildren}
		virtualized
	/>
	<ZText tone="muted">value = {value ?? 'null'}；加载后仍只挂载viewport窗口。</ZText>
</ZStack>
