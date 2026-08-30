<script lang="ts">
	import { ZButton, ZStack, ZText, ZTree, type SelectionKey, type TreeNode } from '@zadmin/zui';

	const nodes: readonly TreeNode[] = [
		{ key: 'services', label: '服务' },
		{ key: 'api', label: 'API网关', parentKey: 'services' },
		{ key: 'docs', label: '文档站', parentKey: 'services' },
		{ key: 'worker', label: '任务执行器', parentKey: 'services' }
	];
	let formRef = $state<HTMLFormElement | null>(null);
	let formValues = $state('未读取');
	let selectedKeys = $state<readonly SelectionKey[]>(['api']);
	function readFormData(): void {
		formValues = formRef ? new FormData(formRef).getAll('services').map(String).join(',') : '';
	}
</script>

<form bind:this={formRef}>
	<ZStack gap="medium">
		<ZTree
			appearance="bare"
			aria-label="多选部署树"
			bind:selectedKeys
			defaultExpandedKeys={['services']}
			defaultSelectedKeys={['api']}
			name="services"
			{nodes}
			selectionMode="multiple"
		/>
		<ZStack direction="row" gap="small" align="center" wrap>
			<ZButton type="button" onclick={readFormData}>读取FormData</ZButton>
			<ZButton type="reset" variant="secondary">重置多选</ZButton>
			<ZText tone="muted">selected = {selectedKeys.join(',') || 'none'}</ZText>
		</ZStack>
		<ZText aria-live="polite" tone="muted">FormData = {formValues}</ZText>
	</ZStack>
</form>
