<script lang="ts">
	import { ZStack, ZStatistic } from '@zadmin/zui';
</script>

<ZStack direction="row" gap="xlarge" wrap>
	<ZStatistic label="整数精度" value={1234.567} precision={0} />
	<ZStatistic label="财务精度" value={1234.567} precision={2} />
	<ZStatistic label="测量精度" value={1234.567} precision={4} />
</ZStack>
