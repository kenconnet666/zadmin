<script module lang="ts">
	import { defineSlotRecipe } from '@zadmin/zui';

	const apiRecipe = defineSlotRecipe(
		{
			slots: ['root', 'title', 'description', 'scroll'] as const,
			base: {
				description: (s) => {
					s.color._textMuted;
					s.lineHeight._relaxed;
					s.margin.raw('0.65rem 0 1rem');
				},
				root: (s) => s.scrollMarginTop.rem(5.5),
				scroll: (s) => {
					s.backgroundColor._canvas;
					s.borderColor._border;
					s.borderRadius._medium;
					s.borderStyle.solid;
					s.borderWidth._hairline;
					s.marginTop._large;
					s.overflowX.auto;
					s._media('(max-width: 48rem)', (mobile) =>
						mobile._selector('& th, & td', (cell) => cell.minWidth.rem(8))
					);
				},
				title: (s) => {
					s.fontSize._xlarge;
					s.letterSpacing.em(-0.03);
					s.margin.px(0);
				}
			},
			variants: {}
		},
		import.meta
	);
</script>

<script lang="ts">
	import { ZHeading, ZTable, useZui } from '@zadmin/zui';
	import { ZCode } from '@zadmin/zui/code';
	import type { ApiSection } from '../framework/component-doc.js';

	let { section }: { section: ApiSection } = $props();
	const zui = useZui();
	const classes = $derived(zui.slots(apiRecipe));
</script>

<section class={classes.root} id={`api-${section.id}`}>
	<ZHeading class={classes.title} level={2} size="xlarge">{section.title}</ZHeading>
	{#if section.description}<p class={classes.description}>{section.description}</p>{/if}
	<!-- svelte-ignore a11y_no_noninteractive_tabindex (keyboard focus is required for horizontal scrolling) -->
	<div class={classes.scroll} role="region" aria-label={`${section.title} API表格`} tabindex="0">
		<ZTable caption={`${section.title} API`} captionHidden density="compact" scroll="none">
			{#snippet header()}
				<tr
					><th scope="col">名称</th><th scope="col">类型</th><th scope="col">默认值</th><th
						scope="col">特性</th
					><th scope="col">说明</th></tr
				>
			{/snippet}
			{#each section.rows as row (row.name)}
				<tr data-deprecated={row.deprecatedSince ? 'true' : undefined}>
					<td><ZCode code={row.name} inline /></td>
					<td><ZCode code={row.type} inline /></td>
					<td><ZCode code={row.default ?? '—'} inline /></td>
					<td
						>{[
							row.required ? 'required' : '',
							row.bindable ? 'bindable' : '',
							row.feature ?? '',
							row.deprecatedSince ? `Deprecated since ${row.deprecatedSince}` : '',
							row.replacement ? `Replacement: ${row.replacement}` : '',
							row.removeAfter ? `Remove after ${row.removeAfter}` : '',
							row.migration ? `Migration: ${row.migration}` : '',
							row.since ? `Since ${row.since}` : ''
						]
							.filter(Boolean)
							.join(' · ') || '—'}</td
					>
					<td>{row.description}</td>
				</tr>
			{/each}
		</ZTable>
	</div>
</section>
