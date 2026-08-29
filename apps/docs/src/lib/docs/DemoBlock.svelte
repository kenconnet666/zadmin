<script module lang="ts">
	import { defineSlotRecipe } from '@zadmin/zui';

	const demoRecipe = defineSlotRecipe(
		{
			slots: ['root', 'header', 'title', 'preview', 'source'] as const,
			base: {
				header: (s) => {
					s.alignItems.start;
					s.borderBottomColor._border;
					s.borderBottomStyle.solid;
					s.borderBottomWidth._hairline;
					s.display.flex;
					s.gap._large;
					s.justifyContent.spaceBetween;
					s.padding._large;
					s._media('(max-width: 48rem)', (mobile) => mobile.flexDirection.column);
				},
				preview: (s) => {
					s.alignContent.center;
					s.backgroundColor._canvas;
					s.display.grid;
					s.minHeight.rem(10);
					s.padding.rem(2);
					s._media('(max-width: 48rem)', (mobile) => mobile.padding._large);
				},
				root: (s) => {
					s.backgroundColor._canvas;
					s.borderColor._border;
					s.borderRadius._large;
					s.borderStyle.solid;
					s.borderWidth._hairline;
					s.boxShadow._small;
					s.overflow.hidden;
					s.scrollMarginTop.rem(5.5);
				},
				source: (s) => {
					s.borderTopColor._border;
					s.borderTopStyle.solid;
					s.borderTopWidth._hairline;
					s.maxHeight.rem(32);
					s.overflow.auto;
				},
				title: (s) => {
					s.fontSize._medium;
					s.margin.raw('0 0 0.35rem');
				}
			},
			variants: {}
		},
		import.meta
	);
</script>

<script lang="ts">
	import { onDestroy } from 'svelte';
	import { ZButton, ZIcon, ZStack, ZText, useZui } from '@zadmin/zui';
	import { ZCode } from '@zadmin/zui/code';
	import type { DemoDefinition } from '../catalog/index.js';

	let { demo }: { demo: DemoDefinition } = $props();
	let expanded = $state(false);
	let copyState = $state<'copied' | 'failed' | 'idle'>('idle');
	const source = $derived(demo.source.trim());
	const Demo = $derived(demo.component);
	const zui = useZui();
	const classes = $derived(zui.slots(demoRecipe));
	let resetTimer: ReturnType<typeof setTimeout> | undefined;

	async function copySource() {
		try {
			await navigator.clipboard.writeText(source);
			copyState = 'copied';
		} catch {
			copyState = 'failed';
		}
		if (resetTimer !== undefined) clearTimeout(resetTimer);
		resetTimer = setTimeout(() => (copyState = 'idle'), 1200);
	}

	onDestroy(() => {
		if (resetTimer !== undefined) clearTimeout(resetTimer);
	});
</script>

<section class={classes.root} id={demo.id}>
	<header class={classes.header}>
		<div>
			<h3 class={classes.title}>{demo.title}</h3>
			<ZText tone="muted">{demo.description}</ZText>
		</div>
		<ZStack direction="row" gap="small">
			<ZButton size="small" variant="ghost" onclick={() => (expanded = !expanded)}>
				<ZIcon name="chevronDown" size={16} />
				{expanded ? '收起源码' : '查看源码'}
			</ZButton>
			<ZButton size="small" variant="secondary" onclick={copySource}>
				{copyState === 'copied' ? '已复制' : copyState === 'failed' ? '复制失败' : '复制'}
			</ZButton>
		</ZStack>
	</header>
	<div class={classes.preview} data-testid={`demo-${demo.id}`}>
		<Demo />
	</div>
	{#if expanded}
		<div class={classes.source} data-testid={`source-${demo.id}`}>
			<ZCode ariaLabel={`${demo.title}源码`} code={source} lang="svelte" lineNumbers />
		</div>
	{/if}
</section>
