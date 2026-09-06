<script module lang="ts">
	import { defineSlotRecipe } from '@zadmin/zui';

	const actionsRecipe = defineSlotRecipe(
		{
			layer: 'utilities',
			slots: ['root', 'copy', 'icon', 'label', 'reserve'] as const,
			base: {
				root: (s) => {
					s.maxWidth.percent(100);
					s.minWidth.px(0);
				},
				copy: (s) => {
					s.flexShrink(0);
					s.whiteSpace.nowrap;
				},
				icon: (s) => {
					s.blockSize._medium;
					s.inlineSize._medium;
					s.flexShrink(0);
				},
				label: (s) => {
					s.display.grid;
					s._selector('& > span', (s) => s.gridArea.raw('1 / 1'));
					s.textAlign.center;
				},
				reserve: (s) => s.visibility.hidden
			},
			variants: {}
		},
		import.meta
	);
</script>

<script lang="ts">
	import Check from '@lucide/svelte/icons/check';
	import Copy from '@lucide/svelte/icons/copy';
	import { onDestroy, untrack, type Snippet } from 'svelte';
	import { useZui, ZButton, ZStack, ZVisuallyHidden } from '@zadmin/zui';

	let { children, source, title }: { children?: Snippet; source: string; title: string } = $props();
	let button = $state<HTMLButtonElement | null>(null);
	let status = $state<'idle' | 'copying' | 'copied' | 'failed'>('idle');
	let generation = 0;
	let timer: number | undefined;
	let timerWindow: Window | undefined;
	const zui = useZui();
	const classes = $derived(zui.slots(actionsRecipe));
	const label = $derived(
		status === 'copied' ? '已复制' : status === 'failed' ? '复制失败' : '复制源码'
	);
	const announcement = $derived(
		status === 'copied' ? `已复制${title}源码。` : status === 'failed' ? '复制失败，请重试。' : ''
	);

	function clearTimer(): void {
		if (timer !== undefined) timerWindow?.clearTimeout(timer);
		timer = undefined;
		timerWindow = undefined;
	}

	$effect(() => {
		void source;
		untrack(() => {
			generation += 1;
			clearTimer();
			status = 'idle';
		});
	});

	async function copySource(): Promise<void> {
		clearTimer();
		const current = ++generation;
		const requestedSource = source;
		const ownerWindow = button?.ownerDocument.defaultView;
		status = 'copying';
		let result: 'copied' | 'failed';
		try {
			const clipboard = ownerWindow?.navigator.clipboard;
			if (!clipboard?.writeText) throw new Error('Clipboard unavailable.');
			await clipboard.writeText(requestedSource);
			result = 'copied';
		} catch {
			result = 'failed';
		}
		if (current !== generation) return;
		status = result;
		if (!ownerWindow) return;
		timerWindow = ownerWindow;
		timer = ownerWindow.setTimeout(() => {
			if (current !== generation) return;
			clearTimer();
			status = 'idle';
		}, 2000);
	}

	onDestroy(() => {
		generation += 1;
		clearTimer();
	});
</script>

<ZStack
	class={classes.root}
	align="center"
	direction="row"
	gap="small"
	wrap
	data-testid="doc-source-actions"
>
	<ZButton
		bind:ref={button}
		class={classes.copy}
		aria-busy={status === 'copying' || undefined}
		disabled={status === 'copying'}
		data-copy-state={status}
		data-testid="copy-demo-source"
		size="medium"
		title={announcement || '复制源码'}
		tone={status === 'copied' ? 'success' : status === 'failed' ? 'danger' : 'neutral'}
		variant="ghost"
		onclick={() => void copySource()}
	>
		{#snippet start()}
			{#if status === 'copied'}
				<Check aria-hidden="true" class={classes.icon} data-copy-icon="check" />
			{:else}
				<Copy aria-hidden="true" class={classes.icon} data-copy-icon="copy" />
			{/if}
		{/snippet}
		<span class={classes.label}>
			<span class={classes.reserve} aria-hidden="true">复制源码</span>
			<span class={classes.reserve} aria-hidden="true">复制失败</span>
			<span>{label}</span>
		</span>
	</ZButton>
	{@render children?.()}
	<ZVisuallyHidden aria-atomic="true" aria-live="polite">{announcement}</ZVisuallyHidden>
</ZStack>
