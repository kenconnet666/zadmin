<script lang="ts">
	import { ZTable } from '@zadmin/zui';
</script>

<ZTable caption="区域流量" density="compact">
	{#snippet header()}<tr><th scope="col">区域</th><th scope="col">请求</th></tr>{/snippet}
	<tr><th scope="row">华东</th><td>12,840</td></tr>
	<tr><th scope="row">华北</th><td>8,120</td></tr>
	{#snippet footer()}<tr><th scope="row">合计</th><td>20,960</td></tr>{/snippet}
</ZTable>
