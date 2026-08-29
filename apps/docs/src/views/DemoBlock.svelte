<script module lang="ts">
	import { defineSlotRecipe } from '@zadmin/zui';

	const demoRecipe = defineSlotRecipe(
		{
			slots: ['root', 'header', 'title', 'preview', 'source'] as const,
			base: {
				header: (s) => {
					s.alignItems.center;
					s.backgroundColor._canvas;
					s.borderBottomColor._border;
					s.borderBottomStyle.solid;
					s.borderBottomWidth._hairline;
					s.display.flex;
					s.gap._large;
					s.justifyContent.spaceBetween;
					s.padding.raw('1rem 1.25rem');
					s._media('(max-width: 48rem)', (mobile) => mobile.flexDirection.column);
				},
				preview: (s) => {
					s.alignContent.center;
					s.backgroundColor._surface;
					s.display.grid;
					s.minHeight.rem(8);
					s.padding.raw('1.75rem 2rem');
					s._media('(max-width: 48rem)', (mobile) => mobile.padding._large);
				},
				root: (s) => {
					s.backgroundColor._canvas;
					s.borderColor._border;
					s.borderRadius._large;
					s.borderStyle.solid;
					s.borderWidth._hairline;
					s.boxShadow._medium;
					s.overflow.hidden;
					s.scrollMarginTop.rem(5.5);
				},
				source: (s) => {
					s.borderTopColor._border;
					s.borderTopStyle.solid;
					s.borderTopWidth._hairline;
					s.overflow.hidden;
				},
				title: (s) => {
					s.fontSize._medium;
					s.fontWeight._semibold;
					s.margin.raw('0 0 0.35rem');
				}
			},
			variants: {}
		},
		import.meta
	);
</script>

<script lang="ts">
	import Check from '@lucide/svelte/icons/check';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import ChevronUp from '@lucide/svelte/icons/chevron-up';
	import Code2 from '@lucide/svelte/icons/code-2';
	import Copy from '@lucide/svelte/icons/copy';
	import { onDestroy } from 'svelte';
	import { ZButton, ZStack, ZText, useZui } from '@zadmin/zui';
	import { ZCode } from '@zadmin/zui/code';
	import type { DemoDefinition } from '../framework/component-doc.js';

	let { demo }: { demo: DemoDefinition } = $props();
	let expanded = $state(false);
	let copyState = $state<'copied' | 'failed' | 'idle'>('idle');
	const source = $derived(demo.source.trim());
	const Demo = $derived(demo.component);
	const zui = useZui();
	const classes = $derived(zui.slots(demoRecipe));
	const sourceId = $derived(`source-${demo.id}`);
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
		<ZStack direction="row" gap="small" wrap>
			<ZButton
				aria-controls={sourceId}
				aria-expanded={expanded}
				size="small"
				variant="ghost"
				onclick={() => (expanded = !expanded)}
			>
				<Code2 aria-hidden="true" size={15} />
				{expanded ? '收起源码' : '查看源码'}
				{#if expanded}
					<ChevronUp aria-hidden="true" size={14} />
				{:else}
					<ChevronDown aria-hidden="true" size={14} />
				{/if}
			</ZButton>
			<ZButton size="small" variant="secondary" onclick={copySource}>
				{#if copyState === 'copied'}
					<Check aria-hidden="true" size={14} />
				{:else}
					<Copy aria-hidden="true" size={14} />
				{/if}
				{copyState === 'copied' ? '已复制' : copyState === 'failed' ? '复制失败' : '复制'}
			</ZButton>
		</ZStack>
	</header>
	<div class={classes.preview} data-testid={`demo-${demo.id}`}>
		<Demo />
	</div>
	{#if expanded}
		<div class={classes.source} data-testid={sourceId} id={sourceId}>
			<ZCode ariaLabel={`${demo.title}源码`} code={source} embedded lang="svelte" lineNumbers />
		</div>
	{/if}
</section>
