<script lang="ts">
	import { ZStack, ZText, ZTree, type TreeLoadContext, type TreeNode } from '@zadmin/zui';

	let nodes = $state<readonly TreeNode<string>[]>([
		{ hasChildren: true, key: 'reports', label: '报表中心' }
	]);
	let attempts = $state(0);

	async function loadChildren(
		node: TreeNode<string>,
		{ signal }: TreeLoadContext<string>
	): Promise<void> {
		attempts += 1;
		await new Promise<void>((resolve, reject) => {
			let timer = 0;
			const cleanup = (): void => signal.removeEventListener('abort', abort);
			const abort = (): void => {
				window.clearTimeout(timer);
				cleanup();
				reject(new window.DOMException('Aborted', 'AbortError'));
			};
			timer = window.setTimeout(() => {
				cleanup();
				resolve();
			}, 500);
			signal.addEventListener('abort', abort, { once: true });
		});
		if (attempts === 1) throw new Error('模拟第一次请求失败');
		nodes = [
			...nodes,
			{ key: 'daily', label: '日报', parentKey: node.key },
			{ key: 'weekly', label: '周报', parentKey: node.key },
			{ key: 'monthly', label: '月报', parentKey: node.key, selectionDisabled: true }
		];
	}
</script>

<ZStack gap="medium">
	<ZText tone="muted">
		第一次展开会进入error；再次激活展开指示后重试成功。请求次数：{attempts}
	</ZText>
	<ZTree
		aria-label="懒加载报表树"
		defaultExpandedKeys={['reports']}
		{nodes}
		onLoadChildren={loadChildren}
		selectionMode="multiple"
		selectionStyle="checkbox"
	/>
</ZStack>
