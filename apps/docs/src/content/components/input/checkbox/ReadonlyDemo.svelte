<script lang="ts">
	import { ZButton, ZCheckbox, ZField, ZStack, ZText } from '@zadmin/zui';

	let locked = $state(true);
	let editable = $state(false);
	let lockedChanges = $state(0);
	let editableChanges = $state(0);
	let submitted = $state('尚未读取');

	function submit(event: SubmitEvent): void {
		event.preventDefault();
		const data = new FormData(event.currentTarget as HTMLFormElement);
		submitted = [...data.entries()].map(([name, value]) => `${name}=${value}`).join(', ') || '无值';
	}
</script>

<form onsubmit={submit}>
	<ZStack gap="medium">
		<ZField
			description="可聚焦、可读取并继续提交当前值，但pointer与Space不会改变状态。"
			label="审计策略"
			name="policy"
			readonly
		>
			<ZCheckbox
				bind:checked={locked}
				data-testid="checkbox-readonly"
				defaultChecked
				onCheckedChange={() => (lockedChanges += 1)}
				value="retained"
			/>
		</ZField>
		<ZField description="只有解除Field/Form只读边界后才允许修改。" label="可编辑对照">
			<ZCheckbox
				bind:checked={editable}
				data-testid="checkbox-editable-contrast"
				name="contrast"
				onCheckedChange={() => (editableChanges += 1)}
				value="enabled"
			/>
		</ZField>
		<ZStack direction="row" gap="small" wrap>
			<ZButton size="small" type="submit">读取FormData</ZButton>
			<ZButton size="small" type="reset" variant="secondary">重置</ZButton>
		</ZStack>
		<ZText tone="muted"
			>只读 = {locked}:{lockedChanges} · 对照 = {editable}:{editableChanges} · {submitted}</ZText
		>
	</ZStack>
</form>
