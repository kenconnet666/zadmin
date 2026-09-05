<script lang="ts">
	import { ZButton, ZField, ZPinInput, ZStack, ZText } from '@zadmin/zui';

	let value = $state<string | null>('');
	let completed = $state(0);
</script>

<form>
	<ZStack gap="medium">
		<ZField
			label="一次性验证码"
			description="支持逐格输入、整段粘贴；聚焦槽位后按Backspace/Delete可清空。"
			required
		>
			<ZPinInput
				bind:value
				inputLabel={(index, length) => `验证码第${index + 1}位，共${length}位`}
				length={6}
				name="otp"
				onComplete={() => (completed += 1)}
			/>
		</ZField>
		<ZStack direction="row" gap="small" wrap>
			<ZButton type="button" variant="secondary" onclick={() => (value = '')}>清空值</ZButton>
			<ZButton type="reset" variant="secondary">重置</ZButton>
		</ZStack>
		<ZText tone="muted">value = {value || 'empty'} · complete = {completed}</ZText>
	</ZStack>
</form>
