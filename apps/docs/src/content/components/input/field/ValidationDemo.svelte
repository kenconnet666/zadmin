<script lang="ts">
	import { ZButton, ZField, ZInput, ZStack, ZText } from '@zadmin/zui';

	let account = $state('');
	const error = $derived(
		account.trim().length > 0 && account.trim().length < 3
			? ['账号至少需要3个字符', '补全账号后错误消息会自动清除。']
			: undefined
	);
	const warning = $derived(
		account !== account.trim() ? '账号首尾包含空格，请确认是否保留。' : undefined
	);
	const success = $derived(account.length >= 3 && !warning ? '格式检查通过。' : undefined);
</script>

<ZStack gap="medium">
	<ZField
		label="Account"
		description="ZField自动连接label、description、error与ZInput。"
		{error}
		{warning}
		{success}
		required
	>
		<ZInput bind:value={account} data-testid="field-account" placeholder="alice" />
	</ZField>
	<ZStack direction="row" gap="small">
		<ZButton size="small" variant="secondary" onclick={() => (account = '')}>清空并重置反馈</ZButton
		>
	</ZStack>
	<ZText tone="muted" size="small"
		>输入1–2个字符显示错误，完整账号显示成功，首尾空格显示非阻断警告。</ZText
	>
</ZStack>
