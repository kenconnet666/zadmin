<script lang="ts">
	import { ZButton, ZCascader, ZField, ZStack, ZText, type TreeNode } from '@zadmin/zui';
	const nodes: readonly TreeNode[] = [
		{ key: 'platform', label: '平台' },
		{ key: 'web', label: 'Web应用', parentKey: 'platform' },
		{ key: 'admin', label: '管理端', parentKey: 'web' },
		{ key: 'docs', label: '文档站', parentKey: 'web' },
		{ key: 'worker', label: '任务执行器', parentKey: 'platform' }
	];
	let value = $state<readonly (string | number)[]>(['platform', 'web', 'docs']);
	let submitted = $state('尚未读取');
</script>

<form>
	<ZStack gap="medium">
		<ZField
			description="叶节点提交完整typed路径；Field label聚焦Trigger。"
			label="部署路径"
			name="path"
			required
		>
			<ZCascader bind:value defaultValue={['platform', 'web', 'docs']} {nodes} />
		</ZField>
		<ZStack direction="row" gap="small">
			<ZButton
				type="button"
				variant="secondary"
				onclick={(event) =>
					(submitted = String(new FormData(event.currentTarget.form!).get('path')))}
			>
				读取FormData
			</ZButton>
			<ZButton type="reset" variant="secondary">重置</ZButton>
		</ZStack>
		<ZText tone="muted">path = {value.join('/')} · {submitted}</ZText>
	</ZStack>
</form>
