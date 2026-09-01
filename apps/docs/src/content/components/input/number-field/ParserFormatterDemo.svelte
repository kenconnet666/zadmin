<script lang="ts">
	import { ZField, ZNumberField, ZStack, ZText } from '@zadmin/zui';

	let ratio = $state<number | undefined>(0.25);
	let capacity = $state<number | undefined>(120);
</script>

<ZStack gap="medium">
	<ZField label="转化率" description="显示层使用百分号；parser把编辑文本还原为0到1的小数。">
		<ZNumberField
			bind:value={ratio}
			precision={3}
			formatter={(value, { defaultFormat }) =>
				`${defaultFormat(value * 100, { maximumFractionDigits: 1 })}%`}
			parser={(input, { defaultParse }) => {
				const parsed = defaultParse(input.replace('%', ''));
				return parsed.valid && parsed.value !== undefined
					? { partial: false, valid: true, value: parsed.value / 100 }
					: parsed;
			}}
		/>
	</ZField>
	<ZText tone="muted">ratio = {ratio ?? '空'}</ZText>

	<ZField
		label="弹性容量"
		description="允许保存越界草稿，但仍暴露invalid；方向键和按钮始终夹紧到边界。"
	>
		<ZNumberField allowOutOfRange bind:value={capacity} max={100} min={0} pageStep={25} />
	</ZField>
	<ZText tone="muted">capacity = {capacity ?? '空'}</ZText>
</ZStack>
