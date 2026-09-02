<script lang="ts">
	import { ZButton, ZField, ZPinInput, ZStack, ZText } from '@zadmin/zui';

	let value = $state<string | null>('');
	let completed = $state(0);
</script>

<form>
	<ZStack gap="medium">
		<ZField label="一次性验证码" description="支持逐格输入和整段粘贴。" required>
			<ZPinInput
				bind:value
				inputLabel={(index, length) => `验证码第${index + 1}位，共${length}位`}
				length={6}
				name="otp"
				onComplete={() => (completed += 1)}
			/>
		</ZField>
		<ZButton type="reset" variant="secondary">重置</ZButton>
		<ZText tone="muted">value = {value || 'empty'} · complete = {completed}</ZText>
	</ZStack>
</form>
