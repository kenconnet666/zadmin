<script lang="ts">
	import { ZButton, ZField, ZRadioGroup, ZRadioGroupItem, ZStack, ZText } from '@zadmin/zui';

	let locked = $state('team');
	let editable = $state('starter');
	let lockedChanges = $state(0);
	let editableChanges = $state(0);
	let submitted = $state('尚未读取');

	function submit(event: SubmitEvent): void {
		event.preventDefault();
		const data = new FormData(event.currentTarget as HTMLFormElement);
		submitted = [...data.entries()].map(([name, value]) => `${name}=${value}`).join(', ');
	}
</script>

<form onsubmit={submit}>
	<ZStack gap="large">
		<ZField
			description="方向键可浏览每个可用radio的焦点，但不会跟随焦点改变选中值。"
			label="锁定方案"
			name="plan"
			readonly
		>
			<ZRadioGroup
				bind:value={locked}
				aria-label="锁定方案"
				data-testid="radio-group-readonly"
				defaultValue="team"
				onValueChange={() => (lockedChanges += 1)}
				orientation="horizontal"
			>
				<label>
					<ZRadioGroupItem value="starter" />
					入门版</label
				>
				<label>
					<ZRadioGroupItem value="team" />
					团队版</label
				>
				<label>
					<ZRadioGroupItem disabled value="legacy" />
					旧版</label
				>
				<label>
					<ZRadioGroupItem value="enterprise" />
					企业版</label
				>
			</ZRadioGroup>
		</ZField>
		<ZField description="解除Field/Form只读边界后，方向键恢复APG选择行为。" label="可编辑对照">
			<ZRadioGroup
				bind:value={editable}
				aria-label="可编辑对照"
				name="contrast"
				onValueChange={() => (editableChanges += 1)}
				orientation="horizontal"
			>
				<label>
					<ZRadioGroupItem value="starter" />
					入门版</label
				>
				<label>
					<ZRadioGroupItem value="team" />
					团队版</label
				>
			</ZRadioGroup>
		</ZField>
		<ZStack direction="row" gap="small" wrap>
			<ZButton size="small" type="button" onclick={() => (locked = 'enterprise')}
				>Owner选择企业版
			</ZButton>
			<ZButton size="small" type="submit" variant="secondary">读取FormData</ZButton>
			<ZButton size="small" type="reset" variant="secondary">重置</ZButton>
		</ZStack>
		<ZText tone="muted"
			>只读 = {locked}:{lockedChanges} · 对照 = {editable}:{editableChanges} · {submitted}</ZText
		>
	</ZStack>
</form>
