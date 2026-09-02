<script lang="ts">
	import { ZButton, ZLoadingBar, ZStack, ZText, type ZLoadingBarProps } from '@zadmin/zui';

	type LoadingBarState = NonNullable<ZLoadingBarProps['state']>;
	let active = $state(true);
	let barState = $state<LoadingBarState>('loading');
	let value = $state<number | undefined>(35);
</script>

<ZStack gap="medium">
	<ZLoadingBar bind:active bind:state={barState} bind:value label="外部owner控制的导入进度" />
	<ZStack direction="row" gap="small" wrap>
		<ZButton
			size="small"
			onclick={() => {
				active = true;
				barState = 'loading';
				value = Math.min(100, (value ?? 0) + 15);
			}}
		>
			外部增加15%
		</ZButton>
		<ZButton
			size="small"
			variant="secondary"
			onclick={() => {
				active = true;
				barState = 'loading';
				value = undefined;
			}}
		>
			切为不确定
		</ZButton>
		<ZButton
			size="small"
			tone="danger"
			onclick={() => {
				active = true;
				barState = 'error';
			}}>外部错误</ZButton
		>
		<ZButton size="small" variant="ghost" onclick={() => (active = !active)}>切换active</ZButton>
	</ZStack>
	<ZText tone="muted">外部数据层仍拥有请求、重试和取消；组件只渲染绑定状态。</ZText>
</ZStack>
