<script module lang="ts">
	import { defineSlotRecipe } from '@zadmin/zui';

	const apiRecipe = defineSlotRecipe(
		{
			layer: 'utilities',
			slots: [
				'root',
				'desktop',
				'table',
				'mobile',
				'mobileRow',
				'term',
				'definition',
				'depth1',
				'depth2',
				'depth3'
			] as const,
			base: {
				depth1: (s) => s.paddingInlineStart._medium,
				depth2: (s) => s.paddingInlineStart._large,
				depth3: (s) => s.paddingInlineStart._xlarge,
				root: (s) => {
					s.minWidth.px(0);
					s.scrollMarginTop.rem(5.5);
				},
				desktop: (s) => {
					s.minWidth.px(0);
					s._media({ max: 'medium' }, (s) => s.display.none);
				},
				table: (s) => {
					s.tableLayout.fixed;
					s.width._full;
					s._selector('& th, & td', (s) => {
						s.boxSizing.borderBox;
						s.minWidth.px(0);
						s.overflowWrap.anywhere;
						s.verticalAlign.top;
					});
					s._selector('& th:nth-child(1)', (s) => s.width.percent(18));
					s._selector('& th:nth-child(2)', (s) => s.width.percent(24));
					s._selector('& th:nth-child(3), & th:nth-child(4)', (s) => s.width.percent(12));
					s._selector('& th:nth-child(5)', (s) => s.width.percent(34));
				},
				mobile: (s) => {
					s.display.none;
					s.margin.px(0);
					s.minWidth.px(0);
					s._media({ max: 'medium' }, (s) => s.display.grid);
				},
				mobileRow: (s) => {
					s.borderBottomColor._border;
					s.borderBottomStyle.solid;
					s.borderBottomWidth._hairline;
					s.display.grid;
					s.gap._small;
					s.gridTemplateColumns.raw('minmax(0, 1fr)');
					s.minWidth.px(0);
					s.padding._large;
					s._selector('&:last-child', (s) => s.borderBottomWidth.px(0));
				},
				term: (s) => {
					s.color._textMuted;
					s.fontSize._small;
					s.fontWeight._semibold;
					s.marginTop._small;
				},
				definition: (s) => {
					s.margin.px(0);
					s.minWidth.px(0);
					s.overflowWrap.anywhere;
				}
			},
			variants: {}
		},
		import.meta
	);
</script>

<script lang="ts">
	import { ZCard, ZHeading, ZStack, ZTable, ZText, useZui } from '@zadmin/zui';
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
	function features(row: ApiRow): string {
		return (
			[
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
				.join(' · ') || '—'
		);
	}
	function rowAttributes(row: ApiRow) {
		return {
			'data-api-row': row.name,
			'data-deprecated': row.deprecatedSince ? 'true' : undefined,
			'data-api-deprecated': row.deprecatedSince ? 'true' : undefined,
			'data-api-required': row.required ? 'true' : undefined,
			'data-api-required-when': row.requiredWhen ?? undefined,
			'data-opaque': row.opaque ? 'true' : undefined,
			'data-opaque-kind': row.opaque?.kind,
			'data-api-replacement': row.replacement ?? undefined,
			'data-api-replacement-external': row.replacementExternal ? 'true' : undefined
		};
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

<section class={classes.root} id={`api-${section.id}`} aria-labelledby={titleId} data-api-reading>
	<ZStack gap="large">
		<ZStack gap="medium">
			<ZHeading id={titleId} level={2} size="xxlarge">{section.title}</ZHeading>
			{#if section.description}<ZText as="p" tone="muted" lineHeight="relaxed" id={descriptionId}>
					{section.description}
				</ZText>{/if}
		</ZStack>
		<ZCard bodyPadding="none" variant="outlined">
			<div class={classes.desktop} data-api-layout="table">
				<ZTable
					class={classes.table}
					caption={`${section.title} API`}
					captionHidden
					density="comfortable"
					scroll="none"
					aria-describedby={section.description ? descriptionId : undefined}
				>
					{#snippet header()}
						<tr
							><th scope="col">名称</th><th scope="col">类型</th><th scope="col">默认值</th><th
								scope="col">特性</th
							><th scope="col">说明</th></tr
						>
					{/snippet}
					{#each rows as row (row.name)}
						<tr {...rowAttributes(row)}>
							<td class={depthClass(row.depth)} data-api-depth={row.depth}>
								<ZCode code={row.name} inline wrap />
							</td>
							<td><ZCode code={row.type} inline wrap /></td>
							<td><ZCode code={row.default ?? '—'} inline wrap /></td>
							<td>{features(row)}</td>
							<td>{row.description}</td>
						</tr>
					{/each}
				</ZTable>
			</div>
			<dl class={classes.mobile} data-api-layout="stack">
				{#each rows as row (row.name)}
					<div class={classes.mobileRow} {...rowAttributes(row)}>
						<dt class={classes.term}>名称</dt>
						<dd
							class={[classes.definition, depthClass(row.depth)]}
							data-api-depth={row.depth}
							data-api-field="name"
						>
							<ZCode code={row.name} inline wrap />
						</dd>
						<dt class={classes.term}>类型</dt>
						<dd class={classes.definition} data-api-field="type">
							<ZCode code={row.type} inline wrap />
						</dd>
						<dt class={classes.term}>默认值</dt>
						<dd class={classes.definition} data-api-field="default">
							<ZCode code={row.default ?? '—'} inline wrap />
						</dd>
						<dt class={classes.term}>特性</dt>
						<dd class={classes.definition} data-api-field="features">{features(row)}</dd>
						<dt class={classes.term}>说明</dt>
						<dd class={classes.definition} data-api-field="description">{row.description}</dd>
					</div>
				{/each}
			</dl>
		</ZCard>
	</ZStack>
</section>
