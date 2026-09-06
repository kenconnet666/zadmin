<script module lang="ts">
	import type { LucideIcon, LucideProps } from '@lucide/svelte';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import Check from '@lucide/svelte/icons/check';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import Eye from '@lucide/svelte/icons/eye';
	import EyeOff from '@lucide/svelte/icons/eye-off';
	import Menu from '@lucide/svelte/icons/menu';
	import Maximize2 from '@lucide/svelte/icons/maximize-2';
	import Minimize2 from '@lucide/svelte/icons/minimize-2';
	import Minus from '@lucide/svelte/icons/minus';
	import Plus from '@lucide/svelte/icons/plus';
	import Palette from '@lucide/svelte/icons/palette';
	import SlidersHorizontal from '@lucide/svelte/icons/sliders-horizontal';
	import Search from '@lucide/svelte/icons/search';
	import TriangleAlert from '@lucide/svelte/icons/triangle-alert';
	import User from '@lucide/svelte/icons/user';
	import X from '@lucide/svelte/icons/x';
	import type { ZControlSize } from '../../runtime/foundation/control-size.js';
	import { indicatorSizeStyles } from './indicator-size.js';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';

	import { defineRecipe, registerRecipeHmr } from '../../recipes/define.js';

	export const iconManifest = {
		arrowRight: ArrowRight,
		check: Check,
		chevronDown: ChevronDown,
		close: X,
		eye: Eye,
		eyeOff: EyeOff,
		menu: Menu,
		maximize: Maximize2,
		minimize: Minus,
		plus: Plus,
		palette: Palette,
		sliders: SlidersHorizontal,
		restore: Minimize2,
		search: Search,
		user: User,
		warning: TriangleAlert
	} as const satisfies Readonly<Record<string, LucideIcon>>;

	export type ZIconName = keyof typeof iconManifest;
	export type ZIconSize = ZControlSize | 'full';

	export function getIconComponent(name: ZIconName): LucideIcon {
		const component = iconManifest[name];
		if (component === undefined) throw new TypeError(`Unknown ZIcon name "${String(name)}".`);
		return component;
	}

	export interface ZIconProps extends Omit<LucideProps, 'children' | 'name' | 'size'> {
		readonly label?: string;
		readonly name: ZIconName;
		readonly size?: ZIconSize | number;
		ref?: SVGSVGElement | null;
	}

	export const zuiMetadata = {
		category: 'gene',
		id: 'icon',
		importStatement: "import { ZIcon } from '@zadmin/zui';",
		name: 'ZIcon',
		bindings: [
			{ description: '真实Lucide SVG元素引用。', name: 'ref', type: 'SVGSVGElement | null' }
		],
		dependencies: ['@lucide/svelte'],
		events: [],
		keyboard: [],
		parts: [],
		props: [
			{
				default: '必填',
				description: '映射到按需导入Lucide组件的受控图标名。',
				name: 'name',
				required: true,
				type: 'keyof typeof iconManifest'
			},
			{
				default: "componentDefaults.icon.size → 'small'",
				description: 'Theme尺寸token或明确px值。',
				name: 'size',
				type: 'ZIconSize | number'
			},
			{ default: '—', description: '可访问图像名称。', name: 'label', type: 'string' },
			{
				bindable: true,
				default: 'null',
				description: '真实svg引用。',
				name: 'ref',
				type: 'SVGSVGElement | null'
			}
		],
		since: '0.1.0',
		snippets: [],
		source: 'ui/zui/src/components/gene/ZIcon.svelte',
		states: [],
		status: 'stable',
		summary: '统一封装按需导入的Lucide图标，不维护手写SVG path，也不接受任意SVG字符串。'
	} as const satisfies ZuiComponentMetadata;

	const iconRecipe = defineRecipe({
		base: (s) => {
			s.display.inlineBlock;
			s.flexShrink(0);
			s.verticalAlign.middle;
		},
		variants: {
			size: {
				custom: () => undefined,
				full: (s) => {
					s.width._full;
					s.height._full;
				},
				...indicatorSizeStyles
			}
		},
		defaultVariants: { size: 'small' }
	});

	registerRecipeHmr(import.meta, iconRecipe);
</script>

<script lang="ts">
	import { untrack } from 'svelte';
	import type { Attachment } from 'svelte/attachments';

	import {
		applyIcssRootStyle,
		mergeStyles,
		serializeIcssVariables
	} from '../../runtime/foundation/root-style.js';
	import { useZui } from '../../runtime/foundation/context.js';
	import { readIcssCarrier } from '../../runtime/foundation/compiler-bridge.js';
	import { resolveComponentDefault } from '../../runtime/foundation/component-defaults.js';

	let {
		'aria-label': ariaLabel,
		class: className,
		label,
		name,
		ref = $bindable(null),
		size,
		style,
		...rest
	}: ZIconProps = $props();

	const zui = useZui();
	const defaults = $derived(zui.componentDefaults.icon);
	const resolvedSize = $derived(resolveComponentDefault(size, defaults?.size, 'small'));
	const recipeClass = $derived(
		zui.recipe(iconRecipe, { size: typeof resolvedSize === 'number' ? 'custom' : resolvedSize })
	);
	const numericSizeClass = $derived(
		typeof resolvedSize === 'number'
			? zui.icss((s) => {
					s.width.px(resolvedSize);
					s.height.px(resolvedSize);
				})
			: undefined
	);
	const accessibleLabel = $derived(label ?? ariaLabel);
	const icssVariables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(icssVariables)));
	const Icon = $derived(getIconComponent(name));
	const lucideProps = $derived.by((): LucideProps => ({
		...rest,
		strokeWidth: resolveComponentDefault(rest.strokeWidth, defaults?.strokeWidth, undefined),
		'aria-hidden': accessibleLabel ? undefined : 'true',
		'aria-label': accessibleLabel ?? undefined,
		class: [recipeClass, numericSizeClass, className],
		focusable: 'false',
		role: accessibleLabel ? 'img' : undefined,
		style: initialStyle
	}));
	const attachIcon: Attachment<SVGSVGElement> = (node) => {
		ref = node;
		const action = applyIcssRootStyle(node, { style, variables: icssVariables });

		$effect(() => {
			action?.update?.({ style, variables: icssVariables });
		});

		return () => {
			action?.destroy?.();
			if (ref === node) ref = null;
		};
	};
</script>

<Icon {...lucideProps} {@attach attachIcon} />
