<script module lang="ts">
	import { defineSlotRecipe } from '@zadmin/zui';

	const apiRecipe = defineSlotRecipe(
		{
			layer: 'utilities',
			slots: ['root', 'title', 'description', 'scroll', 'depth1', 'depth2', 'depth3'] as const,
			base: {
				depth1: (s) => s.paddingInlineStart._medium,
				depth2: (s) => s.paddingInlineStart._large,
				depth3: (s) => s.paddingInlineStart._xlarge,
				description: (s) => {
					s.color._textMuted;
					s.lineHeight._relaxed;
					s.margin.raw('0.65rem 0 1rem');
				},
				root: (s) => s.scrollMarginTop.rem(5.5),
				scroll: (s) => {
					s.marginTop._large;
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
	import { ZCard, ZHeading, ZTable, ZText, useZui } from '@zadmin/zui';
	import { ZCode } from '@zadmin/zui/code';
	import type { ApiRow, ApiSection } from '../framework/component-doc.js';

	let { section }: { section: ApiSection } = $props();
	const zui = useZui();
	const classes = $derived(zui.slots(apiRecipe));
	type FlattenedApiRow = ApiRow & { readonly depth: number };
	function flattenedRows(rows: readonly ApiRow[], prefix = '', depth = 0): FlattenedApiRow[] {
		return rows.flatMap((row) => {
			const name = prefix ? `${prefix}.${row.name}` : row.name;
			const replacement =
				row.replacement && !row.replacementExternal && prefix
					? `${prefix}.${row.replacement}`
					: row.replacement;
			return [
				{ ...row, name, replacement, depth },
				...flattenedRows(row.members ?? [], name, depth + 1)
			];
		});
	}
	const rows = $derived(flattenedRows(section.rows));
	function opaqueFeature(opaque: ApiRow['opaque']): string {
		if (!opaque) return '';
		const details = [
			`Opaque: ${opaque.kind}/${opaque.resolution} (${opaque.reason})`,
			opaque.source ? `source ${opaque.source}` : '',
			`owner ${opaque.owner}`,
			opaque.genericParameters?.length ? `generic ${opaque.genericParameters.join(', ')}` : '',
			opaque.serializable !== undefined ? `serializable=${opaque.serializable}` : ''
		].filter(Boolean);
		return details.join(' · ');
	}
	const titleId = $derived(`api-${section.id}-title`);
	const descriptionId = $derived(`api-${section.id}-description`);
	const depthClass = (depth: number) =>
		depth <= 0
			? undefined
			: depth === 1
				? classes.depth1
				: depth === 2
					? classes.depth2
					: classes.depth3;
</script>

<section class={classes.root} id={`api-${section.id}`}>
	<ZHeading class={classes.title} id={titleId} level={2} size="xlarge">{section.title}</ZHeading>
	{#if section.description}<ZText as="p" class={classes.description} id={descriptionId}>
			{section.description}
		</ZText>{/if}
	<ZCard bodyPadding="none" class={classes.scroll} variant="outlined">
		<ZTable
			caption={`${section.title} API`}
			captionHidden
			density="compact"
			scrollLabelledBy={titleId}
			scrollDescribedBy={section.description ? descriptionId : undefined}
		>
			{#snippet header()}
				<tr
					><th scope="col">名称</th><th scope="col">类型</th><th scope="col">默认值</th><th
						scope="col">特性</th
					><th scope="col">说明</th></tr
				>
			{/snippet}
			{#each rows as row (row.name)}
				<tr
					data-deprecated={row.deprecatedSince ? 'true' : undefined}
					data-api-deprecated={row.deprecatedSince ? 'true' : undefined}
					data-api-required={row.required ? 'true' : undefined}
					data-api-required-when={row.requiredWhen ?? undefined}
					data-opaque={row.opaque ? 'true' : undefined}
					data-opaque-kind={row.opaque?.kind}
					data-api-replacement={row.replacement ?? undefined}
					data-api-replacement-external={row.replacementExternal ? 'true' : undefined}
				>
					<td class={depthClass(row.depth)} data-api-depth={row.depth}>
						<ZCode code={row.name} inline />
					</td>
					<td><ZCode code={row.type} inline /></td>
					<td><ZCode code={row.default ?? '—'} inline /></td>
					<td
						>{[
							row.required ? 'required' : '',
							row.rest ? 'variadic' : '',
							row.requiredWhen ? `required when ${row.requiredWhen}` : '',
							row.bindable ? 'bindable' : '',
							row.feature ?? '',
							row.deprecatedSince ? `Deprecated since ${row.deprecatedSince}` : '',
							row.replacement ? `Replacement: ${row.replacement}` : '',
							row.removeAfter ? `Remove after ${row.removeAfter}` : '',
							row.migration ? `Migration: ${row.migration}` : '',
							row.since ? `Since ${row.since}` : '',
							opaqueFeature(row.opaque)
						]
							.filter(Boolean)
							.join(' · ') || '—'}</td
					>
					<td>{row.description}</td>
				</tr>
			{/each}
		</ZTable>
	</ZCard>
</section>
