<script module lang="ts">
	import type { Snippet } from 'svelte';

	import type { ZuiComponentMetadata } from '../../../metadata/types.js';
	import type { SelectionKey } from '../../../runtime/collection/selection.js';
	import type { ToolbarItemAttributes, ToolbarKeyPolicy } from './context.svelte.js';
	export type { ToolbarItemAttributes, ToolbarKeyPolicy } from './context.svelte.js';

	export interface ZToolbarItemProps {
		readonly children: Snippet<[props: ToolbarItemAttributes]>;
		readonly disabled?: boolean;
		readonly keyPolicy?: ToolbarKeyPolicy;
		readonly value: SelectionKey;
	}

	export const zuiMetadata = {
		bindings: [],
		category: 'navigation',
		dependencies: ['ZToolbar', 'LogicalCollection', 'MountedElements', 'Svelte attachment'],
		events: [],
		id: 'toolbar-item',
		importStatement: "import { ZToolbarItem } from '@zadmin/zui';",
		keyboard: [],
		name: 'ZToolbarItem',
		parts: [],
		props: [
			{
				default: 'false',
				description: '退出Toolbar导航和Tab序列；spread到Button/Input/ZLink时同步原生禁用语义。',
				name: 'disabled',
				type: 'boolean'
			},
			{
				default: "'toolbar'",
				description: 'control为编辑控件保留冲突的Arrow/Home/End键，非冲突Toolbar轴仍可移动。',
				name: 'keyPolicy',
				type: "'toolbar' | 'control'"
			},
			{
				default: '必填',
				description: 'Toolbar范围内唯一稳定的string/number焦点身份。',
				name: 'value',
				required: true,
				type: 'SelectionKey'
			}
		],
		since: 'unreleased',
		snippets: [
			{
				description: '接收SSR tabindex、禁用语义和稳定attachment；直接spread到真实控件。',
				name: 'children',
				required: true,
				type: 'Snippet<[ToolbarItemAttributes]>'
			}
		],
		source: 'ui/zui/src/components/compound/toolbar/ZToolbarItem.svelte',
		states: [],
		status: 'experimental',
		summary: '不产生DOM的Toolbar异构控件注册边界，保留子控件原生语义与业务事件。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts">
	import { createAttachmentKey, type Attachment } from 'svelte/attachments';

	import { getActiveElement } from '../../../runtime/layer/dom-realm.js';
	import { useZToolbar, type ToolbarCollectionItem } from './context.svelte.js';

	let { children, disabled = false, keyPolicy = 'toolbar', value }: ZToolbarItemProps = $props();
	const toolbar = useZToolbar();
	const attachmentKey = createAttachmentKey();
	let element = $state<HTMLElement | null>(null);
	const resolvedDisabled = $derived(disabled || toolbar.disabled);
	const resolvedKeyPolicy = $derived.by(() => {
		if (keyPolicy !== 'toolbar' && keyPolicy !== 'control')
			throw new TypeError('ZToolbarItem keyPolicy must be toolbar or control.');
		return keyPolicy;
	});
	const attach: Attachment<Element> = (node) => {
		const HTMLElementConstructor = node.ownerDocument.defaultView?.HTMLElement;
		if (!HTMLElementConstructor || !(node instanceof HTMLElementConstructor))
			throw new TypeError('ZToolbarItem must attach to an HTMLElement.');
		const target = node as HTMLElement;
		element = target;
		const handleFocus = () => toolbar.focus(value, 'pointer');
		const preventDisabledActivation = (event: Event) => {
			if (!resolvedDisabled) return;
			event.preventDefault();
			event.stopImmediatePropagation();
		};
		target.addEventListener('focus', handleFocus);
		for (const type of ['pointerdown', 'click', 'auxclick'])
			target.addEventListener(type, preventDisabledActivation, true);
		if (getActiveElement(target) === target) handleFocus();
		return () => {
			target.removeEventListener('focus', handleFocus);
			for (const type of ['pointerdown', 'click', 'auxclick'])
				target.removeEventListener(type, preventDisabledActivation, true);
			if (element === target) element = null;
		};
	};

	$effect(() =>
		toolbar.register((): ToolbarCollectionItem => ({
			disabled: resolvedDisabled,
			element,
			groupKey: undefined,
			key: value,
			keyPolicy: resolvedKeyPolicy,
			selectionDisabled: true,
			textValue: String(value)
		}))
	);
	const attributes: ToolbarItemAttributes = $derived.by(() => ({
		'aria-disabled': resolvedDisabled ? true : undefined,
		[attachmentKey]: attach,
		disabled: resolvedDisabled || undefined,
		tabindex: toolbar.tabIndex(value, resolvedDisabled)
	}));
</script>

{@render children(attributes)}
