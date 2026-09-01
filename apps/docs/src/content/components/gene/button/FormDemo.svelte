<script lang="ts">
	import { tick } from 'svelte';
	import { ZButton, ZField, ZInput, ZStack, ZText } from '@zadmin/zui';

	let actions = $state(0);
	let submissions = $state(0);
	let status = $state('尚未操作');

	function submit(event: SubmitEvent): void {
		event.preventDefault();
		const form = event.currentTarget as HTMLFormElement;
		const data = new FormData(form);
		submissions += 1;
		status = `提交值：${String(data.get('project'))}`;
	}

	async function reset(): Promise<void> {
		await tick();
		status = '表单已恢复默认值';
	}
</script>

<form onsubmit={submit} onreset={() => void reset()}>
	<ZStack gap="medium">
		<ZField label="项目名称" name="project">
			<ZInput defaultValue="ZAdmin" />
		</ZField>
		<ZStack direction="row" gap="small" wrap>
			<ZButton
				onclick={() => {
					actions += 1;
					status = '普通按钮没有触发表单提交';
				}}>普通操作</ZButton
			>
			<ZButton type="submit" variant="secondary">显式提交</ZButton>
			<ZButton type="reset" variant="ghost">重置</ZButton>
		</ZStack>
		<ZText aria-live="polite" tone="muted">
			{status} · actions = {actions} · submissions = {submissions}
		</ZText>
	</ZStack>
</form>
