<script lang="ts">
	import { ZButton, ZField, ZSegmented, ZStack, ZText } from '@zadmin/zui';

	let locked = $state<string | number>('week');
	let editable = $state<string | number>('day');
	let lockedChanges = $state(0);
	let editableChanges = $state(0);
	let submitted = $state('尚未读取');
	const options = [
		{ label: '日', value: 'day' },
		{ label: '周', value: 'week' },
		{ disabled: true, label: '月（冻结）', value: 'month' },
		{ label: '季度', value: 'quarter' }
	] as const;

	function submit(event: SubmitEvent): void {
		event.preventDefault();
		const data = new FormData(event.currentTarget as HTMLFormElement);
		submitted = [...data.entries()].map(([name, value]) => `${name}=${value}`).join(', ');
	}
</script>

<form onsubmit={submit}>
	<ZStack gap="large">
		<ZField description="方向键仅浏览焦点；选中项和成功提交值保持不变。" label="锁定周期" readonly>
			<ZSegmented
				bind:value={locked}
				aria-label="锁定周期"
				data-testid="segmented-readonly"
				defaultValue="week"
				{options}
				name="period"
				onValueChange={() => (lockedChanges += 1)}
			/>
		</ZField>
		<ZField description="解除Field/Form只读边界后恢复选择行为。" label="可编辑对照">
			<ZSegmented
				bind:value={editable}
				aria-label="可编辑对照"
				{options}
				name="contrast"
				onValueChange={() => (editableChanges += 1)}
			/>
		</ZField>
		<ZStack direction="row" gap="small" wrap>
			<ZButton size="small" type="button" onclick={() => (locked = 'quarter')}
				>Owner选择季度
			</ZButton>
			<ZButton size="small" type="submit" variant="secondary">读取FormData</ZButton>
			<ZButton size="small" type="reset" variant="secondary">重置</ZButton>
		</ZStack>
		<ZText tone="muted"
			>只读 = {locked}:{lockedChanges} · 对照 = {editable}:{editableChanges} · {submitted}</ZText
		>
	</ZStack>
</form>
