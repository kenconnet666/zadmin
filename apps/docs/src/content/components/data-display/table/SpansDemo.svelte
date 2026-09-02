<script lang="ts">
	import { ZTable } from '@zadmin/zui';
</script>

<ZTable caption="季度区域门禁">
	{#snippet header()}
		<tr><th rowspan="2" scope="col">区域</th><th colspan="2" scope="colgroup">质量门禁</th></tr>
		<tr><th scope="col">浏览器</th><th scope="col">安全</th></tr>
	{/snippet}
	<tr><th rowspan="2" scope="rowgroup">华东</th><td>通过</td><td>通过</td></tr>
	<tr><td>128项</td><td>0高危</td></tr>
	<tr><th scope="row">欧洲</th><td>待复核</td><td>通过</td></tr>
</ZTable>
