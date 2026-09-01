<script lang="ts">
	import { ZButton, ZField, ZStack, ZSwitch, ZText } from '@zadmin/zui';

	let checked = $state(true);
	let changes = $state(0);
	let submitted = $state('尚未提交');

	function submit(event: SubmitEvent): void {
		event.preventDefault();
		const form = event.currentTarget as HTMLFormElement;
		submitted = new FormData(form).get('alerts')?.toString() ?? '关闭';
	}
</script>

<form onreset={() => (submitted = '尚未提交')} onsubmit={submit}>
	<ZStack gap="medium">
		<ZField
			description="关闭后原生required校验会阻止提交；reset恢复defaultChecked。"
			error={checked ? undefined : '必须启用安全告警'}
			label="安全告警"
			name="alerts"
			required
		>
			<ZSwitch
				bind:checked
				data-testid="switch-alerts"
				defaultChecked
				onCheckedChange={() => (changes += 1)}
				value="enabled"
			/>
		</ZField>
		<ZStack direction="row" gap="small" wrap>
			<ZButton size="small" type="submit">读取FormData</ZButton>
			<ZButton size="small" type="reset" variant="secondary">重置</ZButton>
		</ZStack>
		<ZText tone="muted">checked = {checked} · 用户变更次数 = {changes} · {submitted}</ZText>
	</ZStack>
</form>
