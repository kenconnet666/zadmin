<script module lang="ts">
	import type { LucideIcon, LucideProps } from '@lucide/svelte';
	import Check from '@lucide/svelte/icons/check';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import Menu from '@lucide/svelte/icons/menu';
	import Plus from '@lucide/svelte/icons/plus';
	import Search from '@lucide/svelte/icons/search';
	import TriangleAlert from '@lucide/svelte/icons/triangle-alert';
	import User from '@lucide/svelte/icons/user';
	import X from '@lucide/svelte/icons/x';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';

	import { defineRecipe, registerRecipeHmr } from '../../recipes/define.js';
	import type { ZuiTheme } from '../../theme/types.js';

	export const iconManifest = {
		check: Check,
		chevronDown: ChevronDown,
		close: X,
		menu: Menu,
		plus: Plus,
		search: Search,
		user: User,
		warning: TriangleAlert
	} as const satisfies Readonly<Record<string, LucideIcon>>;

	export type ZIconName = keyof typeof iconManifest;

	export function getIconComponent(name: ZIconName): LucideIcon {
		const component = iconManifest[name];
		if (component === undefined) throw new TypeError(`Unknown ZIcon name "${String(name)}".`);
		return component;
	}

	export interface ZIconProps extends Omit<LucideProps, 'children' | 'name' | 'size'> {
		readonly label?: string;
		readonly name: ZIconName;
		readonly size?: keyof ZuiTheme['size'] | number;
		ref?: SVGSVGElement | null;
	}

	export const zuiMetadata = {
		category: 'gene',
		id: 'icon',
		importStatement: "import { ZIcon } from '@zadmin/zui';",
		name: 'ZIcon',
		props: [
			{
				default: '必填',
				description: '映射到按需导入Lucide组件的受控图标名。',
				name: 'name',
				required: true,
				type: 'keyof typeof iconManifest'
			},
			{
				default: "'small'",
				description: 'Theme尺寸token或明确px值。',
				name: 'size',
				type: "keyof ZuiTheme['size'] | number"
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
		source: 'ui/zui/src/components/gene/ZIcon.svelte',
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
				large: (s) => {
					s.width._large;
					s.height._large;
				},
				medium: (s) => {
					s.width._medium;
					s.height._medium;
				},
				small: (s) => {
					s.width._small;
					s.height._small;
				}
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
	} from '../../runtime/root-style.js';
	import { useZui } from '../../runtime/context.js';
	import { readIcssCarrier } from '../../runtime/compiler-bridge.js';

	let {
		'aria-label': ariaLabel,
		class: className,
		label,
		name,
		ref = $bindable(null),
		size = 'small',
		style,
		...rest
	}: ZIconProps = $props();

	const zui = useZui();
	const recipeClass = $derived(
		zui.recipe(iconRecipe, { size: typeof size === 'number' ? 'custom' : size })
	);
	const numericSizeClass = $derived(
		typeof size === 'number'
			? zui.icss((s) => {
					s.width.px(size);
					s.height.px(size);
				})
			: undefined
	);
	const accessibleLabel = $derived(label ?? ariaLabel);
	const icssVariables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(icssVariables)));
	const Icon = $derived(getIconComponent(name));
	const lucideProps = $derived.by((): LucideProps => ({
		...rest,
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
