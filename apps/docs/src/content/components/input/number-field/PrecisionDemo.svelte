<script lang="ts">
	import { ZField, ZNumberField, ZStack, ZText } from '@zadmin/zui';

	let amount = $state<number | undefined>(0.3);
</script>

<ZStack gap="medium">
	<ZField
		label="结算金额"
		description="方向键步进 0.1；Page 键与 Shift+方向键步进 5。"
		size="large"
	>
		<ZNumberField
			bind:value={amount}
			formatOptions={{ style: 'currency', currency: 'CNY' }}
			max={100}
			min={0}
			pageStep={5}
			precision={2}
			step={0.1}
		/>
	</ZField>
	<ZText tone="muted">精确值 = {amount ?? '空'}</ZText>
	<ZStack align="center" direction="row" gap="small" wrap>
		<ZNumberField defaultValue={2} inputLabel="小尺寸" size="small" />
		<ZNumberField defaultValue={2} inputLabel="中尺寸" size="medium" />
		<ZNumberField defaultValue={2} inputLabel="大尺寸" size="large" />
	</ZStack>
</ZStack>
