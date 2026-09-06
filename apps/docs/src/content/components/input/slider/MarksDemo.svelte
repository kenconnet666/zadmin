<script lang="ts">
	import { ZField, ZSlider, ZStack, ZText } from '@zadmin/zui';

	let value = $state(40);
	let committed = $state('尚未提交');
	const marks = [
		{ label: '安静', value: 0 },
		{ label: '标准', value: 50 },
		{ label: '充分', value: 100 }
	] as const;
</script>

<ZStack direction="row" gap="xlarge" wrap>
	<ZField label="缓存比例" description="松开pointer或完成键盘操作时提交一次。">
		<ZSlider
			bind:value
			formatValue={(current) => `${current}%`}
			{marks}
			onValueCommit={(current) => (committed = `已提交 ${current}%`)}
			valueLabel="always"
		/>
	</ZField>
	<ZField label="垂直反向容量">
		<ZSlider
			aria-label="垂直反向容量"
			defaultValue={60}
			orientation="vertical"
			reversed
			tone="info"
		/>
	</ZField>
</ZStack>
<ZText tone="muted">当前值：{value}% · {committed}</ZText>
