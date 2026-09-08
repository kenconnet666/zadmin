<script lang="ts">
	import {
		ZButton,
		ZProvider,
		ZSortable,
		ZStack,
		ZText,
		controlSizes,
		type ZControlSize,
		type SortableMoveRequest
	} from '@zadmin/zui';
	type Task = { id: string | number; label: string };
	let items = $state<readonly Task[]>([
		{ id: 0, label: '设计系统' },
		{ id: '0', label: '组件文档' },
		{ id: 'release', label: '发布验收' }
	]);
	let size = $state<ZControlSize>('medium');
	let reject = $state(false);
	let deferred = $state(false);
	let horizontal = $state(false);
	let reduced = $state(false);
	let outcome = $state('尚未移动');
	let complete = $state.raw<(() => void) | null>(null);
	async function move(request: SortableMoveRequest<Task, string | number>): Promise<boolean> {
		if (reject) return false;
		if (deferred) {
			const accepted = await new Promise<boolean>((resolve) => {
				const abort = () => {
					complete = null;
					resolve(false);
				};
				request.signal.addEventListener('abort', abort, { once: true });
				complete = () => {
					request.signal.removeEventListener('abort', abort);
					complete = null;
					resolve(true);
				};
			});
			if (!accepted || request.signal.aborted) return false;
		}
		items = request.nextItems;
		return true;
	}
</script>

<ZStack gap="medium">
	<ZStack direction="row" gap="small" wrap>
		{#each controlSizes as option (option)}
			<ZButton
				size="small"
				variant={size === option ? 'solid' : 'outline'}
				aria-pressed={size === option}
				onclick={() => (size = option)}>{option}</ZButton
			>
		{/each}
	</ZStack>
	<ZStack direction="row" gap="small" wrap>
		<ZButton size="small" variant="outline" aria-pressed={reject} onclick={() => (reject = !reject)}
			>拒绝请求：{reject ? '开' : '关'}</ZButton
		>
		<ZButton
			size="small"
			variant="outline"
			aria-pressed={deferred}
			onclick={() => (deferred = !deferred)}>异步确认：{deferred ? '开' : '关'}</ZButton
		>
		<ZButton
			size="small"
			variant="outline"
			aria-pressed={horizontal}
			onclick={() => (horizontal = !horizontal)}>水平布局：{horizontal ? '开' : '关'}</ZButton
		>
		<ZButton
			size="small"
			variant="outline"
			aria-pressed={reduced}
			onclick={() => (reduced = !reduced)}>减少动画：{reduced ? '开' : '关'}</ZButton
		>
		{#if complete}<ZButton size="small" onclick={() => complete?.()}>确认模拟服务端结果</ZButton
			>{/if}
	</ZStack>
	<ZProvider motion={reduced ? 'reduced' : 'auto'} componentDefaults={{ sortable: { size } }}>
		<ZSortable
			{items}
			itemKey={(task) => task.id}
			itemLabel={(task) => task.label}
			aria-label="任务顺序"
			orientation={horizontal ? 'horizontal' : 'vertical'}
			onMoveRequest={move}
			onMoveEnd={(detail) => (outcome = detail.result)}
		/>
	</ZProvider>
	<ZText size="small" tone="muted"
		>当前顺序：{items.map((task) => task.label).join(' → ')} · 结果：{outcome}</ZText
	>
	<ZText size="small" tone="muted"
		>拖动手柄、键盘和前后移动按钮共用请求。数值0与字符串0仍是两个独立身份。</ZText
	>
</ZStack>
