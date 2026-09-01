<script lang="ts">
	import {
		ZButton,
		ZProvider,
		ZStack,
		ZText,
		ZTour,
		type TourStep,
		type ZuiLocalePackOverrides
	} from '@zadmin/zui';

	const localePack = {
		tour: {
			close: '关闭 RTL 导览',
			finish: '完成检查',
			next: '继续',
			previous: '返回',
			progress: (current: string, total: string) => `步骤 ${current} / ${total}`
		}
	} satisfies ZuiLocalePackOverrides;
	const steps: readonly TourStep[] = [
		{
			id: 'scoped',
			target: '.docs-tour-scoped-target',
			placement: 'bottom-start',
			title: '作用域内目标',
			description: '重复 selector 只在 targetRoot 内解析，避免命中页面其他示例。'
		},
		{
			id: 'centered',
			target: null,
			title: '无目标居中步骤',
			description: '显式 null 不视为异常，适合导览开场、总结或跨页面过渡。'
		}
	];
	let open = $state(false);
	let targetRoot = $state<HTMLDivElement | null>(null);
</script>

<ZProvider direction="rtl" {localePack}>
	<ZStack gap="medium">
		<ZButton class="docs-tour-scoped-target" variant="secondary">作用域外同名目标</ZButton>
		<div bind:this={targetRoot}>
			<ZStack direction="row" gap="medium" wrap>
				<ZButton onclick={() => (open = true)}>开始作用域导览</ZButton>
				<ZButton class="docs-tour-scoped-target" variant="secondary">作用域内真实目标</ZButton>
			</ZStack>
		</div>
		<ZText tone="muted">此示例同时验证 RTL、嵌套 locale pack 和显式关闭自动滚动。</ZText>
	</ZStack>
	<ZTour
		bind:open
		scrollIntoViewOptions={false}
		spotlightOffset={12}
		targetRoot={() => targetRoot}
		{steps}
	/>
</ZProvider>
