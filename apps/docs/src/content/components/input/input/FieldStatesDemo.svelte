<script lang="ts">
	import { ZButton, ZField, ZInput, ZStack, ZText } from '@zadmin/zui';

	let account = $state('zui');
	const error = $derived(account.length < 3 ? '账号至少需要3个字符' : undefined);
</script>

<form>
	<ZStack gap="medium">
		<ZField
			description="Field统一提供名称、说明、required和错误关联"
			{error}
			label="账号"
			name="account"
			required
		>
			<ZInput bind:value={account} defaultValue="zui" autocomplete="username" />
		</ZField>
		<ZStack direction="row" gap="small" wrap>
			<ZField label="只读值" name="readonly-value" readonly>
				<ZInput defaultValue="不可编辑但可复制" />
			</ZField>
			<ZField disabled label="禁用值" name="disabled-value">
				<ZInput defaultValue="不会提交" />
			</ZField>
		</ZStack>
		<ZButton type="reset" variant="secondary">恢复默认值</ZButton>
		<ZText aria-live="polite" tone="muted">value = {account} · invalid = {Boolean(error)}</ZText>
	</ZStack>
</form>
