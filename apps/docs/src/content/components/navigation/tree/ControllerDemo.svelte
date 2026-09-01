<script lang="ts">
	import {
		ZButton,
		ZProvider,
		ZStack,
		ZText,
		ZTree,
		type TreeNode,
		type ZTreeController
	} from '@zadmin/zui';

	let nodes = $state<readonly TreeNode<string>[]>([
		{ key: 'platform', label: '平台' },
		{ key: 'api', label: 'API服务', parentKey: 'platform' },
		{ key: 'docs', label: '文档站', parentKey: 'platform' },
		{ key: 'worker', label: '任务执行器', parentKey: 'platform' }
	]);
	let controller = $state<ZTreeController<string> | null>(null);

	function removeActive(): void {
		const key = controller?.activeKey;
		if (key && key !== 'platform') nodes = nodes.filter((node) => node.key !== key);
	}
</script>

<ZProvider direction="rtl">
	<ZStack gap="medium">
		<ZStack direction="row" gap="small" wrap>
			<ZButton size="small" variant="secondary" onclick={() => controller?.focusKey('worker')}>
				定位任务执行器
			</ZButton>
			<ZButton size="small" tone="danger" onclick={removeActive}>移除active节点</ZButton>
		</ZStack>
		<ZTree aria-label="RTL动态服务树" bind:controller defaultExpandedKeys={['platform']} {nodes} />
		<ZText tone="muted">active = {controller?.activeKey ?? 'none'}；RTL中ArrowLeft负责展开。</ZText>
	</ZStack>
</ZProvider>
