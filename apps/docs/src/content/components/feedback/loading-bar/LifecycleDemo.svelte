<script lang="ts">
	import { ZButton, ZLoadingBar, ZStack, ZText, type ZLoadingBarProps } from '@zadmin/zui';

	type LoadingBarState = NonNullable<ZLoadingBarProps['state']>;
	let active = $state(false);
	let controller = $state<ZLoadingBarProps['controller']>(null);
	let barState = $state<LoadingBarState>('idle');
	let value = $state<number | undefined>();
</script>

<ZStack gap="medium">
	<ZLoadingBar
		bind:active
		bind:controller
		bind:state={barState}
		bind:value
		finishDelay={800}
		label="受控发布生命周期"
	/>
	<ZStack direction="row" gap="small" wrap>
		<ZButton size="small" onclick={() => controller?.start()}>start不确定任务</ZButton>
		<ZButton size="small" onclick={() => controller?.update(48)}>update到48%</ZButton>
		<ZButton size="small" tone="danger" onclick={() => controller?.error()}>error持久化</ZButton>
		<ZButton size="small" variant="secondary" onclick={() => controller?.finish()}>
			finish并收尾
		</ZButton>
		<ZButton size="small" variant="ghost" onclick={() => controller?.reset()}>reset</ZButton>
	</ZStack>
	<ZText tone="muted">
		active = {active} · state = {barState} · value = {value ?? 'indeterminate'}
	</ZText>
</ZStack>
