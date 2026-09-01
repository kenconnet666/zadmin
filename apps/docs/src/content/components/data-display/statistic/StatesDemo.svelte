<script lang="ts">
	import { ZStack, ZStatistic } from '@zadmin/zui';
</script>

<ZStack direction="row" gap="xlarge" wrap>
	<ZStatistic label="正在载入订单" value={0} loading />
	<ZStatistic label="健康实例" value={86} tone="success">
		{#snippet suffix()}
			/ 90{/snippet}
	</ZStatistic>
	<ZStatistic label="失败任务" value={7} tone="danger" />
	<ZStatistic label="参考配额" value={5000} tone="muted" />
</ZStack>
