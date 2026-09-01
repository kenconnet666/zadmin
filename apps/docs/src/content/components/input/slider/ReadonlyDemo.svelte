<script lang="ts">
	import { ZButton, ZField, ZSlider, ZStack, ZText } from '@zadmin/zui';

	let locked = $state(35);
	let editable = $state(10);
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
	<ZStack gap="medium">
		<ZField
			description="pointer与数值键被拦截，owner仍可同步新值。"
			label="只读阈值"
			name="threshold"
			readonly
		>
			<ZSlider
				bind:value={locked}
				data-testid="slider-readonly"
				defaultValue={35}
				formatValue={(value) => `${value}%`}
				onValueChange={() => (lockedChanges += 1)}
				step={5}
			/>
		</ZField>
		<ZField description="只有解除Field/Form只读边界后才恢复原生range交互。" label="可编辑对照">
			<ZSlider
				bind:value={editable}
				data-testid="slider-editable-contrast"
				name="contrast"
				onValueChange={() => (editableChanges += 1)}
				step={5}
			/>
		</ZField>
		<ZStack direction="row" gap="small" wrap>
			<ZButton size="small" type="button" onclick={() => (locked = 55)}>Owner设为55%</ZButton>
			<ZButton size="small" type="submit" variant="secondary">读取FormData</ZButton>
			<ZButton size="small" type="reset" variant="secondary">重置</ZButton>
		</ZStack>
		<ZText tone="muted"
			>只读 = {locked}:{lockedChanges} · 对照 = {editable}:{editableChanges} · {submitted}</ZText
		>
	</ZStack>
</form>
