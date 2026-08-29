<script lang="ts">
	import { ZButton, ZRadioGroup, ZRadioGroupItem, ZStack, ZText } from '@zadmin/zui';

	let value = $state('team');
	let changes = $state(0);
	let submitted = $state('尚未提交');

	function submit(event: SubmitEvent): void {
		event.preventDefault();
		const form = event.currentTarget as HTMLFormElement;
		submitted = new FormData(form).get('plan')?.toString() ?? '未选择';
	}
</script>

<form onreset={() => (submitted = '尚未提交')} onsubmit={submit}>
	<ZStack gap="medium">
		<ZRadioGroup
			bind:value
			aria-label="部署方案"
			defaultValue="team"
			name="plan"
			onValueChange={() => (changes += 1)}
			orientation="horizontal"
			required
		>
			<label><ZRadioGroupItem textValue="入门版" value="starter" /> 入门版</label>
			<label><ZRadioGroupItem textValue="团队版" value="team" /> 团队版</label>
			<label><ZRadioGroupItem disabled textValue="旧版" value="legacy" /> 旧版</label>
			<label><ZRadioGroupItem textValue="企业版" value="enterprise" /> 企业版</label>
		</ZRadioGroup>
		<ZStack direction="row" gap="small" wrap>
			<ZButton size="small" type="submit">读取FormData</ZButton>
			<ZButton size="small" type="reset" variant="secondary">重置</ZButton>
		</ZStack>
		<ZText tone="muted">value = {value} · 用户变更次数 = {changes} · {submitted}</ZText>
	</ZStack>
</form>
