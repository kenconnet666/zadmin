<script lang="ts">
	import { ZStack, ZStatistic } from '@zadmin/zui';
</script>

<ZStack direction="row" gap="xlarge" wrap>
	<ZStatistic label="请求总数" value={128430} trend={12.4} />
	<ZStatistic
		label="本月成本"
		value={48219.32}
		trend={-3.1}
		formatOptions={{ style: 'currency', currency: 'CNY' }}
	/>
</ZStack>
