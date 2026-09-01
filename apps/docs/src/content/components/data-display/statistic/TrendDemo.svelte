<script lang="ts">
	import { ZStack, ZStatistic } from '@zadmin/zui';
</script>

<ZStack direction="row" gap="xlarge" wrap>
	<ZStatistic label="转化率" value={18.2} precision={1} trend={2.7}>
		{#snippet suffix()}%{/snippet}
	</ZStatistic>
	<ZStatistic label="错误率" value={0.42} precision={2} trend={-18.25} tone="danger">
		{#snippet suffix()}%{/snippet}
	</ZStatistic>
	<ZStatistic
		label="本地化趋势"
		value={3200}
		trend={0}
		trendLabel={(change, { locale }) =>
			`较上期 ${new Intl.NumberFormat(locale, { maximumFractionDigits: 1, signDisplay: 'exceptZero' }).format(change)}%`}
	/>
</ZStack>
