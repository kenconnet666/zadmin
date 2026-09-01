<script lang="ts">
	import { ZAlert, ZButton, ZStack, ZText, type AlertLive } from '@zadmin/zui';

	let live = $state<AlertLive>('polite');
	let visible = $state(false);
	let revision = $state(0);

	function show(nextLive: AlertLive): void {
		live = nextLive;
		revision += 1;
		visible = true;
	}
</script>

<ZStack gap="medium">
	<ZStack direction="row" gap="small" wrap>
		<ZButton size="small" onclick={() => show('polite')}>插入普通状态</ZButton>
		<ZButton size="small" tone="danger" onclick={() => show('assertive')}>插入紧急错误</ZButton>
		<ZButton size="small" variant="secondary" onclick={() => (visible = false)}>移除Alert</ZButton>
	</ZStack>
	{#if visible}
		{#key revision}
			<ZAlert
				{live}
				title={live === 'assertive' ? '生产发布被阻断' : '后台检查已完成'}
				tone={live === 'assertive' ? 'danger' : 'success'}
			>
				动态插入会公告，但不会移动当前键盘焦点。
			</ZAlert>
		{/key}
	{/if}
	<ZText tone="muted">visible = {visible} · live = {live} · revision = {revision}</ZText>
</ZStack>
