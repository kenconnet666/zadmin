<script lang="ts">
	import {
		ZButton,
		ZStack,
		ZText,
		ZTree,
		type TreeLoadContext,
		type TreeNode,
		type ZTreeController
	} from '@zadmin/zui';

	let nodes = $state<readonly TreeNode<string>[]>([
		{ hasChildren: true, key: 'reports', label: '报表中心' }
	]);
	let attempts = $state(0);
	let aborted = $state(0);
	let treeController = $state<ZTreeController<string> | null>(null);
	let treeRef = $state<HTMLDivElement | null>(null);

	async function loadChildren(
		node: TreeNode<string>,
		{ signal }: TreeLoadContext<string>
	): Promise<void> {
		const attempt = attempts + 1;
		attempts = attempt;
		const ownerWindow = treeRef?.ownerDocument.defaultView;
		if (!ownerWindow) return;
		await new Promise<void>((resolve, reject) => {
			let timer: number | undefined;
			const cleanup = (): void => {
				signal.removeEventListener('abort', abort);
				if (timer !== undefined) ownerWindow.clearTimeout(timer);
			};
			const abort = (): void => {
				aborted += 1;
				cleanup();
				reject(new ownerWindow.DOMException('Aborted', 'AbortError'));
			};
			timer = ownerWindow.setTimeout(() => {
				cleanup();
				resolve();
			}, 500);
			signal.addEventListener('abort', abort, { once: true });
		});
		if (signal.aborted || treeController?.getNode(node.key) === undefined) return;
		if (attempt === 1) {
			throw new Error('模拟第一次请求失败');
		}
		nodes = [
			...nodes,
			{ key: 'daily', label: '日报', parentKey: node.key },
			{ key: 'weekly', label: '周报', parentKey: node.key },
			{ key: 'monthly', label: '月报', parentKey: node.key, selectionDisabled: true }
		];
	}

	function removeReports(): void {
		nodes = nodes.filter(({ key, parentKey }) => key !== 'reports' && parentKey !== 'reports');
	}
</script>

<ZStack gap="medium">
	<ZText tone="muted">
		第一次展开会失败；再次激活展开指示后重试。请求次数：{attempts} · 已取消：{aborted}
	</ZText>
	<ZTree
		aria-label="懒加载报表树"
		bind:controller={treeController}
		defaultExpandedKeys={['reports']}
		bind:ref={treeRef}
		{nodes}
		onLoadChildren={loadChildren}
		selectionMode="multiple"
		selectionStyle="checkbox"
	/>
	<ZButton type="button" variant="outline" onclick={removeReports}>Owner外部移除报表节点</ZButton>
</ZStack>
