<script lang="ts">
	import { ZButton, ZPinInput, ZStack, ZText } from '@zadmin/zui';

	let length = $state(6);
	let value = $state<string | null>('12a345678');
	let normalized = $state('尚未通知');
</script>

<ZStack gap="medium" align="start">
	<ZPinInput
		bind:value
		inputLabel={(index, count) => `受控验证码第${index + 1}位，共${count}位`}
		{length}
		onValueChange={(next) => (normalized = next || 'empty')}
	/>
	<ZStack direction="row" gap="small" wrap>
		<ZButton variant="secondary" onclick={() => (value = null)}>外部清空</ZButton>
		<ZButton variant="secondary" onclick={() => (value = '98x7654321')}>注入非法超长值</ZButton>
		<ZButton variant="secondary" onclick={() => (length = length === 6 ? 4 : 6)}>
			切换为 {length === 6 ? 4 : 6} 位
		</ZButton>
	</ZStack>
	<ZText tone="muted">value = {value ?? 'null'} · normalized = {normalized}</ZText>
</ZStack>
