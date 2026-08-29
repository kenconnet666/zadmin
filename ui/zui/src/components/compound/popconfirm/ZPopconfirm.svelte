<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { ZuiComponentMetadata } from '../../../metadata/types.js';
	import type { PopoverPlacement } from '../popover/ZPopover.svelte';

	export interface ZPopconfirmProps {
		readonly children?: Snippet;
		readonly defaultOpen?: boolean;
		readonly gutter?: number;
		readonly onOpenChange?: (open: boolean) => void;
		open?: boolean;
		readonly placement?: PopoverPlacement;
	}

	export const zuiMetadata = {
		category: 'overlay',
		id: 'popconfirm',
		importStatement:
			"import { ZPopconfirm, ZPopconfirmTrigger, ZPopconfirmContent, ZPopconfirmTitle, ZPopconfirmDescription, ZPopconfirmCancel, ZPopconfirmAction } from '@zadmin/zui';",
		name: 'ZPopconfirm',
		bindings: [{ description: '当前打开状态。', name: 'open', type: 'boolean' }],
		dependencies: ['ZPopover', 'Floating', 'FocusScope'],
		events: [
			{
				description: '打开、取消、确认或dismiss后调用一次。',
				name: 'onOpenChange',
				type: '(open: boolean) => void'
			}
		],
		keyboard: [
			{ description: '关闭并恢复Trigger焦点。', key: 'Escape' },
			{ description: '使用原生按钮确认或取消。', key: 'Enter / Space' }
		],
		parts: [],
		props: [
			{
				bindable: true,
				default: 'undefined',
				description: '当前打开状态。',
				name: 'open',
				type: 'boolean'
			},
			{
				default: 'false',
				description: '非受控初始打开状态。',
				name: 'defaultOpen',
				type: 'boolean'
			},
			{
				default: "'bottom'",
				description: '首选浮层位置。',
				name: 'placement',
				type: 'PopoverPlacement'
			},
			{
				default: '8',
				description: 'Trigger与Content间距，单位px。',
				name: 'gutter',
				type: 'number'
			}
		],
		since: '0.3.0',
		snippets: [{ description: 'Trigger、Content及显式操作。', name: 'children', type: 'Snippet' }],
		source: 'ui/zui/src/components/compound/popconfirm/ZPopconfirm.svelte',
		states: [],
		status: 'experimental',
		summary: '基于非modal Popover的就地危险操作确认复合根组件。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts">
	import { createZuiId } from '../../../runtime/foundation/ids.js';
	import { useZui } from '../../../runtime/foundation/context.js';
	import ZPopover from '../popover/ZPopover.svelte';
	import { provideZPopconfirm, type ZPopconfirmContext } from './context.svelte.js';

	let {
		children,
		defaultOpen = false,
		gutter = 8,
		onOpenChange,
		open = $bindable(),
		placement = 'bottom'
	}: ZPopconfirmProps = $props();
	const zui = useZui();
	const uid = $props.id();
	const idBase = $derived(createZuiId(zui.idPrefix, uid, 'popconfirm'));
	const context: ZPopconfirmContext = {
		get descriptionId() {
			return `${idBase}-description`;
		},
		get titleId() {
			return `${idBase}-title`;
		}
	};
	provideZPopconfirm(context);
</script>

<ZPopover bind:open {defaultOpen} {gutter} modal={false} {onOpenChange} {placement}>
	{@render children?.()}
</ZPopover>
