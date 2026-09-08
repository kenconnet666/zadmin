<script module lang="ts">
	import type { Time } from '@internationalized/date';
	import type { HTMLTimeAttributes } from 'svelte/elements';

	import type { ZuiComponentMetadata } from '../../metadata/types.js';
	import { textRecipe } from '../gene/ZText.svelte';
	import type {
		TypographyLineHeight,
		TypographySize,
		TypographyStyleOptions,
		TypographyTone,
		TypographyWeight
	} from '../gene/typography.js';
	import type { TimeValueGranularity } from '../../runtime/time-value.js';

	// eslint-disable-next-line no-import-assign -- Type-only re-export has no runtime assignment.
	export type { TimeValueGranularity } from '../../runtime/time-value.js';
	export type TimeValueLineHeight = TypographyLineHeight;
	export type TimeValueSize = TypographySize;
	export type TimeValueTone = TypographyTone;
	export type TimeValueWeight = TypographyWeight;

	export interface ZTimeValueProps
		extends Omit<HTMLTimeAttributes, 'children' | 'datetime'>, TypographyStyleOptions {
		readonly granularity?: TimeValueGranularity;
		readonly hourCycle?: 12 | 24;
		readonly locale?: string;
		ref?: HTMLTimeElement | null;
		readonly value: Time;
	}

	export const zuiMetadata = {
		category: 'data-display',
		id: 'time-value',
		importStatement: "import { ZTimeValue } from '@zadmin/zui';",
		name: 'ZTimeValue',
		bindings: [{ description: '真实time元素引用。', name: 'ref', type: 'HTMLTimeElement | null' }],
		dependencies: ['Time', 'Intl.DateTimeFormat', 'ZText typography recipe'],
		events: [],
		keyboard: [],
		parts: [],
		props: [
			{
				default: '无',
				description: '严格的Time显示值；字符串与Date不会被隐式解析。',
				name: 'value',
				required: true,
				type: 'Time'
			},
			{
				default: "'minute'",
				description: '控制显示到hour、minute或second，不改变Time值。',
				name: 'granularity',
				type: "'hour' | 'minute' | 'second'"
			},
			{
				default: 'locale规则',
				description: '显式选择12或24小时显示制。',
				name: 'hourCycle',
				type: '12 | 24'
			},
			{
				default: 'Provider locale',
				description: 'Intl时间格式使用的locale。',
				name: 'locale',
				type: 'string'
			},
			{
				default: "componentDefaults.text.size → 'medium'",
				description: '复用ZText的Theme字号token。',
				name: 'size',
				type: "keyof ZuiTheme['fontSize']"
			},
			{
				default: "componentDefaults.text.lineHeight → 'normal'",
				description: '复用ZText的Theme行高token。',
				name: 'lineHeight',
				type: "keyof ZuiTheme['lineHeight']"
			},
			{
				default: "componentDefaults.text.weight → 'normal'",
				description: '复用ZText的Theme字重token。',
				name: 'weight',
				type: "keyof ZuiTheme['fontWeight']"
			},
			{
				default: "componentDefaults.text.tone → 'neutral'",
				description: '复用ZText的语义颜色。',
				name: 'tone',
				type: 'TimeValueTone'
			},
			{
				default: 'false',
				description: '单行省略显示。',
				name: 'truncate',
				type: 'boolean'
			},
			{
				default: 'undefined',
				description: '多行省略的正整数行数；与truncate互斥。',
				name: 'lineClamp',
				type: 'number'
			},
			{
				default: 'true',
				description: '使用tabular-nums稳定时间宽度。',
				name: 'tabularNumbers',
				type: 'boolean'
			},
			{
				bindable: true,
				default: 'null',
				description: '真实time元素引用。',
				name: 'ref',
				type: 'HTMLTimeElement | null'
			}
		],
		since: 'unreleased',
		snippets: [],
		source: 'ui/zui/src/components/data-display/ZTimeValue.svelte',
		states: [
			{
				description: '实际显示精度。',
				name: 'data-granularity',
				values: ['hour', 'minute', 'second']
			},
			{ description: '实际小时制。', name: 'data-hour-cycle', values: ['12', '24'] }
		],
		status: 'experimental',
		summary: '以语义time元素和ZText主题能力本地化展示Time，不拥有编辑或表单状态。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts">
	import { untrack } from 'svelte';

	import { resolveComponentDefault } from '../../runtime/foundation/component-defaults.js';
	import { readIcssCarrier } from '../../runtime/foundation/compiler-bridge.js';
	import { useZui } from '../../runtime/foundation/context.js';
	import {
		applyIcssRootStyle,
		mergeStyles,
		serializeIcssVariables
	} from '../../runtime/foundation/root-style.js';
	import { resolveHourCycle } from '../../runtime/date.js';
	import {
		formatTimeValue,
		normalizeTimeValue,
		serializeTimeValue
	} from '../../runtime/time-value.js';
	import { resolveTypographyOverflow } from '../gene/typography.js';

	let {
		class: className,
		granularity = 'minute',
		hourCycle,
		lineClamp,
		lineHeight,
		locale,
		ref = $bindable(null),
		size,
		style,
		tabularNumbers = true,
		tone,
		truncate = false,
		value,
		weight,
		...rest
	}: ZTimeValueProps = $props();
	const zui = useZui();
	const defaults = $derived(zui.componentDefaults.text);
	const resolvedLocale = $derived(locale ?? zui.locale);
	const resolvedHourCycle = $derived(
		hourCycle ?? resolveHourCycle(resolvedLocale, zui.localePack.time.hourCycle)
	);
	const normalizedValue = $derived(normalizeTimeValue(value, 'ZTimeValue value'));
	const formattedValue = $derived(
		formatTimeValue(normalizedValue, resolvedLocale, {
			granularity,
			hourCycle: resolvedHourCycle
		})
	);
	const typography = $derived({
		lineHeight: resolveComponentDefault(lineHeight, defaults?.lineHeight, 'normal'),
		size: resolveComponentDefault(size, defaults?.size, 'medium'),
		tone: resolveComponentDefault(tone, defaults?.tone, 'neutral'),
		weight: resolveComponentDefault(weight, defaults?.weight, 'normal')
	});
	const overflow = $derived(resolveTypographyOverflow({ lineClamp, tabularNumbers, truncate }));
	const rootClass = $derived(
		zui.recipe(textRecipe, { ...typography, truncate: overflow.truncate })
	);
	const icssVariables = $derived(readIcssCarrier(rest));
	const authoredStyle = $derived(mergeStyles(style, overflow.inlineStyle));
	const initialStyle = untrack(() =>
		mergeStyles(authoredStyle, serializeIcssVariables(icssVariables))
	);
</script>

<time
	{...rest}
	bind:this={ref}
	class={[rootClass, className]}
	style={initialStyle}
	use:applyIcssRootStyle={{ style: authoredStyle, variables: icssVariables }}
	datetime={serializeTimeValue(normalizedValue)}
	data-granularity={granularity}
	data-hour-cycle={resolvedHourCycle}
	data-line-clamp={overflow.lineClamp}
	data-tabular-numbers={tabularNumbers || undefined}>{formattedValue}</time
>
