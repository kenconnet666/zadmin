<script module lang="ts">
	import type { ZuiComponentMetadata } from '../../../metadata/types.js';
	import { defineRecipe, registerRecipeHmr } from '../../../recipes/define.js';
	import type { ZDialogContentProps } from '../dialog/ZDialogContent.svelte';

	export type DrawerPlacement = 'bottom' | 'end' | 'start' | 'top';
	export type DrawerSize = 'full' | 'large' | 'medium' | 'small';
	export type ZDrawerContentProps = Omit<ZDialogContentProps, 'appearance' | 'role'> & {
		readonly placement?: DrawerPlacement;
		readonly size?: DrawerSize;
	};

	const drawerContentRecipe = defineRecipe({
		base: (s) => {
			s.backgroundColor._canvas;
			s.borderColor._border;
			s.borderStyle.solid;
			s.borderWidth._hairline;
			s.boxShadow._medium;
			s.color._text;
			s.overflow.auto;
			s.padding._xlarge;
			s.position.fixed;
			s.transitionDuration._normal;
			s.transitionProperty.raw('transform');
			s.transitionTimingFunction.ease;
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
		dependencies: ['ZDrawer', 'ZDialogContent', 'logical properties', 'Presence'],
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
				description: '沿滑入轴的面板尺寸。',
				name: 'size',
				type: "'small' | 'medium' | 'large' | 'full'"
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
		states: [{ description: '打开状态。', name: 'data-state', values: ['open', 'closed'] }],
		status: 'experimental',
		summary: '基于逻辑方向、可配置尺寸和Presence过渡的modal侧滑内容。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts">
	import { useZui } from '../../../runtime/foundation/context.js';
	import ZDialogContent from '../dialog/ZDialogContent.svelte';
	import { useZDialog } from '../dialog/context.svelte.js';

	let {
		class: className,
		placement = 'end',
		ref = $bindable(null),
		size = 'medium',
		...rest
	}: ZDrawerContentProps = $props();
	const zui = useZui();
	const dialog = useZDialog();
	const rootClass = $derived(
		zui.recipe(drawerContentRecipe, {
			direction: zui.direction,
			motion: zui.motion,
			open: dialog.open,
			placement,
			size
		})
	);
</script>

<ZDialogContent
	{...rest}
	appearance="unstyled"
	bind:ref
	class={[rootClass, className]}
	role="dialog"
/>
