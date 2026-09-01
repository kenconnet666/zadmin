<script lang="ts">
	import {
		ZButton,
		ZCascader,
		ZStack,
		ZText,
		type TreeLoadContext,
		type TreeNode
	} from '@zadmin/zui';

	interface PendingLoad {
		readonly complete: () => void;
		readonly fail: () => void;
	}

	let nodes = $state<readonly TreeNode[]>([
		{ hasChildren: true, key: 'remote', label: '远程空间' },
		{ key: 'local', label: '本地空间' },
		{ key: 'local-dev', label: '开发环境', parentKey: 'local' }
	]);
	let attempts = $state(0);
	let pending = $state<PendingLoad | undefined>();
	let error = $state('none');

	function loadChildren(node: TreeNode, { signal }: TreeLoadContext): Promise<void> {
		attempts += 1;
		error = 'none';
		return new Promise((resolve, reject) => {
			const cleanup = () => signal.removeEventListener('abort', abort);
			const abort = () => {
				cleanup();
				pending = undefined;
				reject(new Error('aborted'));
			};
			signal.addEventListener('abort', abort, { once: true });
			pending = {
				complete: () => {
					cleanup();
					nodes = [
						...nodes,
						{ key: 'remote-prod', label: '生产环境', parentKey: node.key },
						{ key: 'remote-stage', label: '预发环境', parentKey: node.key }
					];
					pending = undefined;
					resolve();
				},
				fail: () => {
					cleanup();
					pending = undefined;
					reject(new Error('模拟网络失败'));
				}
			};
		});
	}
</script>

<ZStack gap="medium">
	<ZCascader
		{nodes}
		onLoadChildren={loadChildren}
		onLoadError={(_key, cause) => (error = cause instanceof Error ? cause.message : String(cause))}
		placeholder="选择异步路径"
	/>
	<ZStack direction="row" gap="small" wrap>
		<ZButton disabled={!pending} onclick={() => pending?.complete()} variant="secondary"
			>完成加载</ZButton
		>
		<ZButton disabled={!pending} onclick={() => pending?.fail()} variant="secondary"
			>使加载失败</ZButton
		>
		<ZButton
			disabled={!nodes.some(({ key }) => key === 'remote')}
			onclick={() =>
				(nodes = nodes.filter(({ key, parentKey }) => key !== 'remote' && parentKey !== 'remote'))}
			variant="secondary"
		>
			移除请求节点
		</ZButton>
	</ZStack>
	<ZText tone="muted">attempts = {attempts} · pending = {Boolean(pending)} · error = {error}</ZText>
</ZStack>
