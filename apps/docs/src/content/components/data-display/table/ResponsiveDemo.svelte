<script lang="ts">
	import { ZTable, ZText } from '@zadmin/zui';

	let wrapperRef = $state<HTMLDivElement | null>(null);
</script>

<ZTable
	bind:wrapperRef
	caption="跨区域发布矩阵"
	captionHidden
	scrollLabel="跨区域发布矩阵横向滚动区"
	style="min-width: 58rem;"
>
	{#snippet header()}
		<tr>
			<th scope="col">应用</th><th scope="col">华东版本</th><th scope="col">华北版本</th><th
				scope="col">欧洲版本</th
			><th scope="col">负责人</th><th scope="col">最近变更</th>
		</tr>
	{/snippet}
	<tr>
		<th scope="row">文档站</th><td>v2.4.0</td><td>v2.4.0</td><td>v2.3.9</td><td>Docs Team</td><td
			>2026-09-02 14:30</td
		>
	</tr>
	<tr>
		<th scope="row">任务执行器</th><td>v5.1.2</td><td>v5.1.1</td><td>v5.1.1</td><td>Runtime Team</td
		><td>2026-09-02 13:10</td>
	</tr>
</ZTable>
<ZText tone="muted"
	>wrapperRef = {wrapperRef ? 'connected' : 'null'}；仅真实溢出时region进入Tab顺序。</ZText
>
