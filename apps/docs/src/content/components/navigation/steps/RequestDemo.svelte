<script lang="ts">
	import {
		ZButton,
		ZStack,
		ZSteps,
		ZText,
		type StepsItem,
		type StepRequestEvent
	} from '@zadmin/zui';
	type Key = 'profile' | 'configure' | 'publish';
	const items: readonly StepsItem<Key>[] = [
		{ key: 'profile', title: '基础信息', status: 'complete', clickable: true },
		{ key: 'configure', title: '部署配置', clickable: true },
		{ key: 'publish', title: '确认发布', clickable: true }
	];
	let current = $state<Key | null>('profile');
	let requested = $state<Key | null>(null);
	let steps: { reset(): void };
	function request(event: StepRequestEvent<Key>): void {
		event.preventDefault();
		requested = event.key;
	}
	function accept(): void {
		if (requested !== null) current = requested;
		requested = null;
	}
</script>

<ZStack gap="medium">
	<ZSteps
		bind:this={steps}
		{items}
		bind:currentKey={current}
		onStepRequest={request}
		aria-label="需要确认的部署流程"
	/>
	<ZText role="status"
		>{requested
			? `已请求 ${requested}，等待调用方确认。`
			: `当前步骤：${current ?? '无当前步骤'}`}</ZText
	>
	<ZStack direction="row" gap="small" wrap>
		<ZButton disabled={requested === null} onclick={accept}>确认切换</ZButton>
		<ZButton variant="outline" disabled={requested === null} onclick={() => (requested = null)}
			>取消请求</ZButton
		>
		<ZButton
			variant="ghost"
			onclick={() => {
				steps.reset();
				requested = null;
			}}>重置本实例</ZButton
		>
	</ZStack>
	<ZText tone="muted"
		>需要异步校验时，同样先preventDefault，再由调用方在校验结束后写currentKey。组件不会保存业务表单、请求网络或提前切换。</ZText
	>
</ZStack>
