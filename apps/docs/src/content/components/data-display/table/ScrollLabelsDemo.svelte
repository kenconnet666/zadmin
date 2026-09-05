<script lang="ts">
	import { ZHeading, ZTable, ZText } from '@zadmin/zui';
</script>

<ZHeading level={3} id="table-scroll-demo-title">发布矩阵</ZHeading>
<ZText as="p" id="table-scroll-demo-description">横向滚动查看所有区域列。</ZText>
<ZTable
	caption="发布矩阵"
	scroll="auto"
	scrollLabelledBy="table-scroll-demo-title"
	scrollDescribedBy="table-scroll-demo-description"
	style="min-inline-size: 48rem;"
>
	{#snippet header()}
		<tr
			><th scope="col">应用</th><th scope="col">华东</th><th scope="col">华北</th><th scope="col"
				>欧洲</th
			></tr
		>
	{/snippet}
	<tr><th scope="row">文档站</th><td>v2.4</td><td>v2.4</td><td>v2.3</td></tr>
</ZTable>
