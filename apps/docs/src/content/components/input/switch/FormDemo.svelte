<script lang="ts">
	import { ZButton, ZStack, ZSwitch, ZText } from '@zadmin/zui';

	let checked = $state(false);
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
		<label>
			<ZSwitch
				bind:checked
				data-testid="switch-alerts"
				name="alerts"
				onCheckedChange={() => (changes += 1)}
				value="enabled"
			/>
			启用安全告警
		</label>
		<ZStack direction="row" gap="small" wrap>
			<ZSwitch aria-label="小尺寸开关" size="small" />
			<ZSwitch aria-label="大尺寸开关" defaultChecked size="large" />
			<ZSwitch aria-label="禁用开关" disabled />
		</ZStack>
		<ZStack direction="row" gap="small" wrap>
			<ZButton size="small" type="submit">读取FormData</ZButton>
			<ZButton size="small" type="reset" variant="secondary">重置</ZButton>
		</ZStack>
		<ZText tone="muted">checked = {checked} · 用户变更次数 = {changes} · {submitted}</ZText>
	</ZStack>
</form>
