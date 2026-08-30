<script lang="ts">
	import { ZTable } from '@zadmin/zui';
</script>

<ZTable caption="最近发布" striped>
	{#snippet header()}<tr
			><th scope="col">应用</th><th scope="col">版本</th><th scope="col">状态</th></tr
		>{/snippet}
	<tr><th scope="row">文档站</th><td>v2.4.0</td><td>正常</td></tr>
	<tr><th scope="row">管理后台</th><td>v2.3.8</td><td>构建中</td></tr>
</ZTable>
