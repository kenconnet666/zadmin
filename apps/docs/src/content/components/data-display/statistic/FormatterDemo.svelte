<script lang="ts">
	import { ZStack, ZStatistic } from '@zadmin/zui';
</script>

<ZStack direction="row" gap="xlarge" wrap>
	<ZStatistic
		label="紧凑访问量"
		value={12_480_000}
		locale="zh-CN"
		formatter={(value, { locale }) =>
			new Intl.NumberFormat(locale, { maximumFractionDigits: 1, notation: 'compact' }).format(
				value
			)}
	/>
	<ZStatistic
		label="精确事件序号"
		value={12_345_678_901_234_567_890n}
		locale="en-US"
		formatter={(value, { locale, options }) =>
			`#${new Intl.NumberFormat(locale, { ...options, useGrouping: true }).format(value)}`}
	/>
</ZStack>
