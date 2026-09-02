<script lang="ts">
	import { ZButton, ZLink, ZTable, ZTag, ZText } from '@zadmin/zui';

	let action = $state('none');
</script>

<ZTable caption="部署操作入口" data-action={action}>
	{#snippet header()}<tr
			><th scope="col">部署</th><th scope="col">状态</th><th scope="col">操作</th></tr
		>{/snippet}
	<tr>
		<th scope="row"><ZLink href="#/components/table">文档站</ZLink></th>
		<td><ZTag tone="success">健康</ZTag></td>
		<td
			><ZButton size="small" variant="secondary" onclick={() => (action = 'rollback')}>回滚</ZButton
			></td
		>
	</tr>
	<tr>
		<th scope="row"><ZLink href="#/components/table">任务执行器</ZLink></th>
		<td><ZTag tone="warning">观察中</ZTag></td>
		<td
			><ZButton size="small" variant="ghost" onclick={() => (action = 'inspect')}>检查</ZButton></td
		>
	</tr>
</ZTable>
<ZText tone="muted">action = {action}</ZText>
