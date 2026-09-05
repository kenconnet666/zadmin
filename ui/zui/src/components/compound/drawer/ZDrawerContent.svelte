<script module lang="ts">
	import type { ZuiComponentMetadata } from '../../../metadata/types.js';
	import { defineRecipe, registerRecipeHmr } from '../../../recipes/define.js';
	import type { ZDialogContentProps } from '../dialog/ZDialogContent.svelte';

	export type DrawerPlacement = 'bottom' | 'end' | 'start' | 'top';
	export type DrawerPresetSize = 'full' | 'large' | 'medium' | 'small';
	export type DrawerSize = DrawerPresetSize | number | string;
	export type ZDrawerContentProps = Omit<ZDialogContentProps, 'appearance' | 'dir' | 'role'> & {
		readonly placement?: DrawerPlacement;
		readonly size?: DrawerSize;
	};

	const drawerContentRecipe = defineRecipe({
		base: (s) => {
			s.backgroundColor._canvas;
			s.borderColor._border;
			s.borderStyle.solid;
			s.borderWidth._hairline;
			s.boxSizing.borderBox;
			s.boxShadow._medium;
			s.color._text;
			s.overflow.auto;
			s.padding._xlarge;
			s.position.fixed;
			s.transitionDuration._normal;
			s.transitionProperty.raw('transform');
			s.transitionTimingFunction._standard;
			s.zIndex._modal;
			s._focusVisible((focus) => {
				focus.outlineColor._focus;
				focus.outlineOffset.px(-3);
				focus.outlineStyle.solid;
				focus.outlineWidth._medium;
			});
		},
		variants: {
			direction: { ltr: () => undefined, rtl: () => undefined },
			motion: {
				auto: () => undefined,
				full: () => undefined,
				reduced: (s) => s.transitionDuration.ms(0)
			},
			open: { false: () => undefined, true: (s) => s.transform.raw('translate(0, 0)') },
			size: {
				custom: () => undefined,
				full: (s) => {
					s.height._full;
					s.width._full;
				},
				large: (s) => {
					s.height._drawerLarge;
					s.width._drawerLarge;
				},
				medium: (s) => {
					s.height._drawerMedium;
					s.width._drawerMedium;
				},
				small: (s) => {
					s.height._drawerSmall;
					s.width._drawerSmall;
				}
			},
			placement: {
				bottom: (s) => {
					s.insetBlockEnd.px(0);
					s.insetInlineEnd.px(0);
					s.insetInlineStart.px(0);
					s.maxHeight.vh(90);
					s.width._full;
				},
				end: (s) => {
					s.height._full;
					s.insetBlockEnd.px(0);
					s.insetBlockStart.px(0);
					s.insetInlineEnd.px(0);
					s.maxWidth.vw(90);
				},
				start: (s) => {
					s.height._full;
					s.insetBlockEnd.px(0);
					s.insetBlockStart.px(0);
					s.insetInlineStart.px(0);
					s.maxWidth.vw(90);
				},
				top: (s) => {
					s.insetBlockStart.px(0);
					s.insetInlineEnd.px(0);
					s.insetInlineStart.px(0);
					s.maxHeight.vh(90);
					s.width._full;
				}
			}
		},
		compoundVariants: [
			{
				style: (s) => s.transform.raw('translateY(100%)'),
				when: { open: false, placement: 'bottom' }
			},
			{
				style: (s) => s.transform.raw('translateX(100%)'),
				when: { direction: 'ltr', open: false, placement: 'end' }
			},
			{
				style: (s) => s.transform.raw('translateX(-100%)'),
				when: { direction: 'rtl', open: false, placement: 'end' }
			},
			{
				style: (s) => s.transform.raw('translateX(-100%)'),
				when: { direction: 'ltr', open: false, placement: 'start' }
			},
			{
				style: (s) => s.transform.raw('translateX(100%)'),
				when: { direction: 'rtl', open: false, placement: 'start' }
			},
			{
				style: (s) => s.transform.raw('translateY(-100%)'),
				when: { open: false, placement: 'top' }
			},
			{
				style: (s) => s.maxWidth.vw(100),
				when: { placement: 'end', size: 'full' }
			},
			{
				style: (s) => s.maxWidth.vw(100),
				when: { placement: 'start', size: 'full' }
			},
			{
				style: (s) => s.maxHeight.vh(100),
				when: { placement: 'bottom', size: 'full' }
			},
			{
				style: (s) => s.maxHeight.vh(100),
				when: { placement: 'top', size: 'full' }
			}
		],
		defaultVariants: {
			direction: 'ltr',
			motion: 'auto',
			open: false,
			placement: 'end',
			size: 'medium'
		}
	});
	registerRecipeHmr(import.meta, drawerContentRecipe);

	export const zuiMetadata = {
		category: 'overlay',
		id: 'drawer-content',
		importStatement: "import { ZDrawerContent } from '@zadmin/zui';",
		name: 'ZDrawerContent',
		bindings: [
			{ description: '挂载期间的真实dialog引用。', name: 'ref', type: 'HTMLDivElement | null' }
		],
		dependencies: [
			'ZDrawer',
			'ZDialogContent',
			'logical properties',
			'responsive CSS sizing',
			'Presence'
		],
		events: [],
		keyboard: [
			{ description: '关闭并恢复焦点。', key: 'Escape' },
			{
				description: '在Drawer内部循环焦点。',
				key: 'Tab / Shift+Tab'
			}
		],
		parts: [],
		props: [
			{
				default: "'end'",
				description: '逻辑边方向；RTL会自动翻转start/end。',
				name: 'placement',
				type: "'top' | 'bottom' | 'start' | 'end'"
			},
			{
				default: "'medium'",
				description: '沿滑入轴的预设或CSS尺寸；number按px处理，非full值仍受90vw/90vh窄屏边界约束。',
				name: 'size',
				type: "'small' | 'medium' | 'large' | 'full' | number | string"
			},
			{
				bindable: true,
				default: 'null',
				description: '挂载期间的真实dialog引用。',
				name: 'ref',
				type: 'HTMLDivElement | null'
			}
		],
		since: 'unreleased',
		snippets: [
			{ description: 'Title、Description、业务内容与Close。', name: 'children', type: 'Snippet' }
		],
		source: 'ui/zui/src/components/compound/drawer/ZDrawerContent.svelte',
		states: [
			{ description: '打开状态。', name: 'data-state', values: ['open', 'closed'] },
			{
				description: '进入与退出的可视动画阶段。',
				name: 'data-motion-state',
				values: ['entering', 'entered', 'exiting']
			},
			{
				description: '解析后的逻辑位置。',
				name: 'data-placement',
				values: ['top', 'bottom', 'start', 'end']
			},
			{
				description: '解析后的尺寸预设；number和CSS值统一为custom。',
				name: 'data-size',
				values: ['small', 'medium', 'large', 'full', 'custom']
			},
			{ description: '解析后的减少动画状态。', name: 'data-reduced-motion', values: ['true'] }
		],
		status: 'stable',
		summary: '基于逻辑方向、可配置尺寸和Presence过渡的modal侧滑内容。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts">
	import { onDestroy, untrack } from 'svelte';
	import { useZui } from '../../../runtime/foundation/context.js';
	import { mergeStyles } from '../../../runtime/foundation/root-style.js';
	import ZDialogContent from '../dialog/ZDialogContent.svelte';
	import { useZDialog } from '../dialog/context.svelte.js';
	import { DrawerEntryMotion } from './entry-motion.svelte.js';

	function isPresetSize(size: DrawerSize): size is DrawerPresetSize {
		switch (size) {
			case 'full':
			case 'large':
			case 'medium':
			case 'small':
				return true;
			default:
				return false;
		}
	}

	function customSizeValue(size: DrawerSize): string | undefined {
		if (isPresetSize(size)) return undefined;
		if (typeof size === 'number') {
			if (!Number.isFinite(size) || size < 0) {
				throw new TypeError('Drawer size must be a finite non-negative number.');
			}
			return `${size}px`;
		}
		const value = size.trim();
		if (!value) throw new TypeError('Drawer size must not be empty.');
		if (/[;{}]/u.test(value)) {
			throw new TypeError('Drawer size must be a single CSS value, not a declaration list.');
		}
		return value;
	}

	let {
		class: className,
		placement = 'end',
		ref = $bindable(null),
		size = 'medium',
		style,
		...rest
	}: ZDrawerContentProps = $props();
	const zui = useZui();
	const dialog = useZDialog();
	const entryMotion = new DrawerEntryMotion(untrack(() => dialog.open));
	const presetSize = $derived(isPresetSize(size) ? size : 'custom');
	const customSize = $derived(customSizeValue(size));
	const sizeStyle = $derived(
		customSize === undefined
			? ''
			: `${placement === 'top' || placement === 'bottom' ? 'height' : 'width'}:${customSize}`
	);
	const contentStyle = $derived(mergeStyles(style, sizeStyle));
	const motionState = $derived(
		dialog.open ? (entryMotion.entered ? 'entered' : 'entering') : 'exiting'
	);
	const rootClass = $derived(
		zui.recipe(drawerContentRecipe, {
			direction: zui.direction,
			motion: dialog.reducedMotion ? 'reduced' : 'full',
			open: entryMotion.entered,
			placement,
			size: presetSize
		})
	);
	$effect(() => entryMotion.update(dialog.open, dialog.reducedMotion, ref));
	onDestroy(() => entryMotion.destroy());
</script>

<ZDialogContent
	{...rest}
	appearance="unstyled"
	bind:ref
	class={[rootClass, className]}
	data-motion-state={motionState}
	data-placement={placement}
	data-size={presetSize}
	dir={zui.direction}
	role="dialog"
	style={contentStyle}
/>
