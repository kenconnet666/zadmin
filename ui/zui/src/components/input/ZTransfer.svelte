<script module lang="ts">
	import type { ZControlSize } from '../../runtime/foundation/control-size.js';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';
	import type {
		CollectionMutationResult,
		CollectionMutationSource
	} from '../../runtime/collection/mutation.js';
	import type { SelectionKey } from '../../runtime/collection/selection.js';
	import type { TransferDestination } from '../../runtime/collection/transfer.js';

	export interface TransferItem {
		readonly description?: string;
		readonly disabled?: boolean;
		readonly key: SelectionKey;
		readonly label: string;
	}

	export type TransferMoveSource = CollectionMutationSource;
	export type TransferMoveResult = CollectionMutationResult;

	export interface TransferMoveRequest {
		readonly destination: TransferDestination;
		readonly movingKeys: readonly SelectionKey[];
		readonly value: readonly SelectionKey[];
		readonly nextValue: readonly SelectionKey[];
		readonly source: TransferMoveSource;
		readonly signal: AbortSignal;
	}

	export interface TransferMoveEnd {
		readonly request: TransferMoveRequest;
		readonly result: TransferMoveResult;
		readonly error?: unknown;
	}

	type TransferMoveMode = 'immediate' | 'request';
	type ZTransferDomProps = Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'onchange'>;

	interface ZTransferSharedProps {
		readonly controlId?: string;
		readonly defaultValue?: readonly SelectionKey[];
		readonly disabled?: boolean;
		readonly dragDrop?: boolean;
		readonly emptyText?: string;
		readonly filter?: (item: TransferItem, query: string) => boolean;
		readonly filterable?: boolean;
		readonly form?: string;
		readonly invalid?: boolean;
		readonly items: readonly TransferItem[];
		readonly loading?: boolean;
		readonly loadingText?: string;
		readonly moveToSourceLabel?: string;
		readonly moveToTargetLabel?: string;
		readonly name?: string;
		readonly nonce?: string;
		readonly onMoveEnd?: (detail: TransferMoveEnd) => void;
		readonly readonly?: boolean;
		ref?: HTMLDivElement | null;
		readonly required?: boolean;
		readonly searchPlaceholder?: string;
		readonly size?: ZControlSize;
		readonly sourceTitle?: string;
		readonly targetTitle?: string;
		value?: readonly SelectionKey[];
		readonly virtual?: boolean;
		readonly virtualHeight?: number;
		readonly virtualItemSize?: number;
		readonly virtualOverscan?: number;
	}

	interface ZTransferImmediateSemanticProps extends ZTransferSharedProps {
		readonly moveMode?: 'immediate';
		readonly onMoveRequest?: never;
		readonly onValueChange?: (value: readonly SelectionKey[]) => void;
	}

	interface ZTransferRequestedSemanticProps extends ZTransferSharedProps {
		readonly moveMode: 'request';
		readonly onMoveRequest: (request: TransferMoveRequest) => boolean | Promise<boolean>;
		readonly onValueChange?: never;
	}

	export type ZTransferProps = ZTransferDomProps &
		(ZTransferImmediateSemanticProps | ZTransferRequestedSemanticProps);
	type ZTransferSemanticProps<TMode extends TransferMoveMode = TransferMoveMode> = {
		readonly moveMode?: TMode;
	} & (
		| ('immediate' extends TMode ? ZTransferImmediateSemanticProps : never)
		| ('request' extends TMode ? ZTransferRequestedSemanticProps : never)
	);
	type ZTransferComponentProps<TMode extends TransferMoveMode = TransferMoveMode> =
		ZTransferDomProps & ZTransferSemanticProps<TMode>;

	export const zuiMetadata = {
		category: 'input',
		id: 'transfer',
		importStatement: "import { ZTransfer } from '@zadmin/zui';",
		name: 'ZTransfer',
		bindings: [
			{ description: '目标集合的有序typed key。', name: 'value', type: 'readonly SelectionKey[]' },
			{ description: '真实根节点引用。', name: 'ref', type: 'HTMLDivElement | null' }
		],
		dependencies: [
			'LogicalCollection',
			'Transfer membership transaction',
			'SelectionModel',
			'CollectionNavigation',
			'ActiveDescendant',
			'ZVirtualList',
			'FormValueBridge',
			'@dnd-kit/dom cross-pane adapter'
		],
		events: [
			{
				description: 'immediate模式用户移动项目后调用一次；request模式不调用。',
				name: 'onValueChange',
				type: '(value: readonly SelectionKey[]) => void'
			},
			{
				description: 'request模式把冻结候选交给唯一外部value owner接受或拒绝。',
				name: 'onMoveRequest',
				type: '(request: TransferMoveRequest) => boolean | Promise<boolean>'
			},
			{
				description: '已发出的移动请求以接受、拒绝、取消、过期或异常结束。',
				name: 'onMoveEnd',
				type: '(detail: TransferMoveEnd) => void'
			}
		],
		keyboard: [
			{
				description: '在当前pane view的enabled项目间移动active key。',
				key: 'ArrowUp / ArrowDown / Home / End'
			},
			{ description: '切换当前active项目的临时勾选。', key: 'Enter / Space' },
			{ description: '选择当前pane过滤view中的全部enabled项目。', key: 'Ctrl / Meta + A' },
			{ description: '按Provider locale标签前缀移动active key。', key: 'Typeahead' },
			{ description: '从筛选输入进入对应listbox。', key: 'ArrowUp / ArrowDown' },
			{
				description: 'dragDrop启用时，把active项目或其已勾选组移到相反pane；物理方向按RTL解析。',
				key: 'Alt + ArrowLeft / ArrowRight'
			}
		],
		parts: [
			{ description: '来源或目标pane。', name: 'panel' },
			{ description: '容器焦点的多选listbox。', name: 'list' },
			{ description: '真实option或虚拟option wrapper。', name: 'item' },
			{ description: 'option可见正文。', name: 'item-content' },
			{ description: '双向移动操作区。', name: 'controls' },
			{ description: '加载、空集合或异步孤儿状态。', name: 'status' }
		],
		props: [
			{
				default: "'immediate'",
				description: 'immediate由组件写value一次；request由外部owner写入nextValue并回声确认。',
				name: 'moveMode',
				requiredWhen: "request分支必须显式为'request'；immediate可省略",
				type: "'immediate' | 'request'"
			},
			{
				default: 'undefined',
				description: 'immediate模式禁止；返回true仍需外部value与nextValue精确同序回声才accepted。',
				name: 'onMoveRequest',
				requiredWhen: "moveMode='request'时必填",
				type: '(request: TransferMoveRequest) => boolean | Promise<boolean>',
				callable: {
					parameters: [
						{
							name: 'request',
							type: 'TransferMoveRequest',
							required: true,
							description: '本次冻结的membership候选与取消信号；调用方决定是否写回nextValue。',
							members: [
								{
									name: 'destination',
									type: 'TransferDestination',
									required: true,
									description: '逻辑source或target，不因RTL交换业务含义。'
								},
								{
									name: 'movingKeys',
									type: 'readonly SelectionKey[]',
									required: true,
									description: '本次实际可移动的loaded enabled key。'
								},
								{
									name: 'value',
									type: 'readonly SelectionKey[]',
									required: true,
									description: '请求开始时的目标成员快照。'
								},
								{
									name: 'nextValue',
									type: 'readonly SelectionKey[]',
									required: true,
									description: '接受时应精确写回的有序目标成员；保留未加载key。'
								},
								{
									name: 'source',
									type: 'TransferMoveSource',
									required: true,
									description: '操作来源；中间按钮、键盘快捷移动或跨栏pointer drop。'
								},
								{
									name: 'signal',
									type: 'AbortSignal',
									required: true,
									description: '过期、禁用、模式切换、reset或卸载时中止；业务据此释放等待资源。'
								}
							]
						}
					]
				}
			},
			{
				default: 'undefined',
				description: '两种模式的移动终态通知；不拥有或回滚canonical value。',
				name: 'onMoveEnd',
				type: '(detail: TransferMoveEnd) => void',
				callable: {
					parameters: [
						{
							name: 'detail',
							type: 'TransferMoveEnd',
							required: true,
							description: '唯一终态快照；卸载后不会调用。',
							members: [
								{
									name: 'request',
									type: 'TransferMoveRequest',
									required: true,
									description: '原始请求对象，与onMoveRequest收到的对象相同。'
								},
								{
									name: 'result',
									type: 'TransferMoveResult',
									required: true,
									description: 'accepted、rejected、cancelled、stale或error。'
								},
								{
									name: 'error',
									type: 'unknown',
									description: '处理器抛出的原始错误；组件公告不直接暴露其内容。'
								}
							]
						}
					]
				}
			},
			{
				name: 'size',
				type: "'xsmall' | 'small' | 'medium' | 'large' | 'xlarge'",
				default: 'Field size，其次为 Provider density',
				description:
					'统一面板、过滤输入、列表文字与转移动作尺寸；virtualItemSize 仍独立拥有虚拟行高。'
			},
			{
				default: '继承Field或自动生成',
				description: '来源listbox这一业务值焦点owner的id。',
				name: 'controlId',
				type: 'string'
			},
			{
				default: '必填',
				description: '权威完整数据源；key必须是唯一string或有限number且不能为-0。',
				name: 'items',
				required: true,
				type: 'readonly TransferItem[]',
				members: [
					{
						description: '唯一业务身份；排序、筛选和移动后保持不变。',
						name: 'key',
						type: 'SelectionKey',
						required: true
					},
					{ description: '选项显示文本。', name: 'label', type: 'string', required: true },
					{ description: '选项补充说明。', name: 'description', type: 'string' },
					{ description: '禁止选择或移动该项。', name: 'disabled', type: 'boolean' }
				]
			},
			{
				bindable: true,
				default: '[]',
				description: '目标集合typed key；未加载的异步孤儿默认保留并继续提交。',
				name: 'value',
				type: 'readonly SelectionKey[]'
			},
			{
				default: '[]',
				description: '非受控初始目标集合与form reset目标。',
				name: 'defaultValue',
				type: 'readonly SelectionKey[]'
			},
			{
				default: 'Provider localePack.transfer.empty',
				description: 'pane view为空且不在loading时的状态文本；异步孤儿使用独立locale状态。',
				name: 'emptyText',
				type: 'string'
			},
			{
				default: '最近祖先form',
				description: '把最终value的重复同名entries关联到DOM外部form；两侧筛选草稿不会参与。',
				name: 'form',
				type: 'string'
			},
			{
				default: 'true',
				description: '显示两侧辅助过滤输入。',
				name: 'filterable',
				type: 'boolean'
			},
			{
				default: 'Provider locale的标签与说明contains',
				description: '只产生pane view；不修改临时勾选或最终value。',
				name: 'filter',
				type: '(item: TransferItem, query: string) => boolean'
			},
			{
				default: 'false',
				description: '保留现有items并向两栏暴露aria-busy。',
				name: 'loading',
				type: 'boolean'
			},
			{
				default: 'Provider localePack.collection.loading',
				description: '加载状态文本。',
				name: 'loadingText',
				type: 'string'
			},
			{
				default: '继承Field或false',
				description: '投射到根和来源业务listbox，不把筛选输入伪装成业务值owner。',
				name: 'invalid',
				type: 'boolean'
			},
			{
				default: 'false',
				description: '禁用焦点、勾选、移动与FormData。',
				name: 'disabled',
				type: 'boolean'
			},
			{
				default: 'false',
				description:
					'启用跨栏pointer拖放与listbox上的RTL感知Alt+水平方向键快捷移动；仍复用同一移动事务。',
				name: 'dragDrop',
				type: 'boolean'
			},
			{
				default: 'undefined',
				description: '启用dragDrop时传给底层StyleInjector的CSP nonce，同时保留原生nonce属性。',
				name: 'nonce',
				type: 'string'
			},
			{
				default: 'Provider localePack.transfer.moveToSource',
				description: '返回来源pane按钮的可访问名称。',
				name: 'moveToSourceLabel',
				type: 'string'
			},
			{
				default: 'Provider localePack.transfer.moveToTarget',
				description: '移入目标pane按钮的可访问名称。',
				name: 'moveToTargetLabel',
				type: 'string'
			},
			{
				default: 'false',
				description: '保持listbox可聚焦导航和值可提交，但禁止筛选编辑、勾选与移动。',
				name: 'readonly',
				type: 'boolean'
			},
			{
				default: 'false',
				description: '启用两栏固定行虚拟窗口。',
				name: 'virtual',
				type: 'boolean'
			},
			{
				default: '256',
				description: '每个虚拟pane viewport高度，单位px。',
				name: 'virtualHeight',
				type: 'number'
			},
			{
				default: '52',
				description: '虚拟option固定高度，单位px。',
				name: 'virtualItemSize',
				type: 'number'
			},
			{
				default: '4',
				description: '每栏虚拟窗口上下额外项数。',
				name: 'virtualOverscan',
				type: 'number'
			},
			{
				default: '继承Field或false',
				description: '投射到来源业务listbox；最终value校验仍由Field/Form schema拥有。',
				name: 'required',
				type: 'boolean'
			},
			{
				default: 'Provider localePack.transfer.filterPlaceholder',
				description: '两侧辅助筛选输入的placeholder；查询不是表单字段。',
				name: 'searchPlaceholder',
				type: 'string'
			},
			{
				default: 'Provider localePack.transfer.sourceTitle',
				description: '来源pane标题和listbox可访问名称。',
				name: 'sourceTitle',
				type: 'string'
			},
			{
				default: 'Provider localePack.transfer.targetTitle',
				description: '目标pane标题和listbox可访问名称。',
				name: 'targetTitle',
				type: 'string'
			},
			{
				default: '继承Field或undefined',
				description: '每个最终value重复使用的FormData字段名。',
				name: 'name',
				type: 'string'
			}
		],
		since: 'unreleased',
		snippets: [],
		source: 'ui/zui/src/components/input/ZTransfer.svelte',
		states: [
			{
				description:
					'根节点为idle/pending移动事务状态，项目为selected/unselected临时勾选；与数据loading分开。',
				name: 'data-state',
				values: ['idle', 'pending', 'selected', 'unselected']
			},
			{
				description: '解析尺寸。',
				name: 'data-size',
				values: ['xsmall', 'small', 'medium', 'large', 'xlarge']
			},
			{ description: '整个Transfer或项目禁用。', name: 'data-disabled', values: ['true'] },
			{ description: '整个Transfer只读。', name: 'data-readonly', values: ['true'] },
			{ description: '整个Transfer无效。', name: 'data-invalid', values: ['true'] },
			{ description: '异步数据仍在加载。', name: 'data-loading', values: ['true'] },
			{
				description: '拖动中的来源item；virtual模式标记在其item-content上。',
				name: 'data-dragging',
				values: ['true']
			},
			{
				description: '当前允许接收跨栏移动的相反panel。',
				name: 'data-drop-target',
				values: ['true']
			}
		],
		status: 'stable',
		summary:
			'从唯一LogicalCollection派生双pane，以独立SelectionModel管理临时勾选；支持显式immediate/request移动事务、异步孤儿、多值FormData和固定行虚拟化。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts" generics="TMode extends TransferMoveMode = TransferMoveMode">
	/* eslint-disable svelte/prefer-svelte-reactivity -- Sets use immutable replacement or are local normalization scratch. */
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import { onDestroy, tick, untrack } from 'svelte';
	import { defineRecipe, registerRecipeHmr } from '../../recipes/define.js';
	import { ActiveDescendant } from '../../runtime/collection/active-descendant.svelte.js';
	import {
		CollectionNavigation,
		isKeyboardComposing
	} from '../../runtime/collection/collection-navigation.svelte.js';
	import { LogicalCollection } from '../../runtime/collection/logical-collection.js';
	import { navigationIntent } from '../../runtime/collection/list-navigation.js';
	import { MountedElements } from '../../runtime/collection/mounted-elements.svelte.js';
	import { SelectionModel } from '../../runtime/collection/selection-model.js';
	import type { Selection } from '../../runtime/collection/selection.js';
	import {
		createTransferMoveCandidate,
		matchesTransferItemsSnapshot,
		matchesTransferValueEcho,
		matchesTransferValueSnapshot,
		type TransferMoveCandidate
	} from '../../runtime/collection/transfer.js';
	import { Typeahead } from '../../runtime/collection/typeahead.js';
	import { readIcssCarrier } from '../../runtime/foundation/compiler-bridge.js';
	import { ControllableState } from '../../runtime/foundation/controllable-state.svelte.js';
	import { useZui } from '../../runtime/foundation/context.js';
	import { resolveControlSize } from '../../runtime/foundation/control-size.js';
	import { createZuiId } from '../../runtime/foundation/ids.js';
	import {
		containsComposedNode,
		getActiveElement,
		getElementDirection,
		isDomHtmlElement
	} from '../../runtime/layer/dom-realm.js';
	import {
		applyIcssRootStyle,
		mergeStyles,
		serializeIcssVariables
	} from '../../runtime/foundation/root-style.js';
	import { claimZFieldControlOwner } from '../../runtime/form/field-context.js';
	import { mergeAriaIds } from '../../runtime/form/form-control.svelte.js';
	import FormValueBridge from '../../runtime/form/FormValueBridge.svelte';
	import {
		createChoiceVirtualMountBridge,
		type ChoiceVirtualController
	} from '../compound/choice-virtualization.js';
	import ZButton from '../gene/ZButton.svelte';
	import ZVisuallyHidden from '../gene/ZVisuallyHidden.svelte';
	import TransferPane from './TransferPane.svelte';
	import {
		TransferDragDropAdapter,
		type TransferDragDropContext
	} from './transfer-drag-drop.svelte.js';

	type Side = 'source' | 'target';
	const rootRecipe = defineRecipe({
		base: (s) => {
			s.fontFamily._sans;
			s.lineHeight._compact;
			s.alignItems.stretch;
			s.display.flex;
			s.flexWrap.wrap;
			s.gap._medium;
		},
		variants: {
			size: {
				xsmall: (s) => {
					s.fontSize._xsmall;
				},
				small: (s) => {
					s.fontSize._small;
				},
				medium: (s) => {
					s.fontSize._medium;
				},
				large: (s) => {
					s.fontSize._large;
				},
				xlarge: (s) => {
					s.fontSize._large;
				}
			},
			disabled: { false: () => undefined, true: (s) => s.opacity._disabled }
		},
		defaultVariants: { disabled: false }
	});
	const controlsRecipe = defineRecipe({
		base: (s) => {
			s.alignItems.center;
			s.display.flex;
			s.flexDirection.column;
			s.gap._small;
			s.justifyContent.center;
		},
		variants: {},
		defaultVariants: {}
	});
	registerRecipeHmr(import.meta, rootRecipe);
	registerRecipeHmr(import.meta, controlsRecipe);

	function normalizeKeys(source: readonly SelectionKey[], name: string): readonly SelectionKey[] {
		const keys = new Set<SelectionKey>();
		for (const key of source) {
			if (
				(typeof key !== 'string' && typeof key !== 'number') ||
				(typeof key === 'number' && (!Number.isFinite(key) || Object.is(key, -0)))
			) {
				throw new TypeError(`${name} keys must be strings or finite numbers other than -0.`);
			}
			keys.add(key);
		}
		return Object.freeze([...keys]);
	}

	function selectionKeys(
		selection: Selection<SelectionKey>,
		viewKeys: readonly SelectionKey[]
	): ReadonlySet<SelectionKey> {
		return new Set(selection === 'all' ? viewKeys : selection);
	}

	function equalSets(left: ReadonlySet<SelectionKey>, right: ReadonlySet<SelectionKey>): boolean {
		if (left.size !== right.size) return false;
		for (const key of left) if (!right.has(key)) return false;
		return true;
	}

	let {
		'aria-busy': ariaBusy,
		'aria-describedby': ariaDescribedBy,
		'aria-labelledby': ariaLabelledBy,
		class: className,
		controlId: controlIdProp,
		defaultValue = [],
		disabled: disabledProp = false,
		dir,
		dragDrop = false,
		emptyText,
		filter,
		filterable = true,
		form,
		id,
		invalid,
		items,
		loading = false,
		loadingText,
		moveToSourceLabel,
		moveToTargetLabel,
		moveMode = 'immediate' as TMode,
		name: nameProp,
		nonce,
		onMoveEnd,
		onMoveRequest,
		onValueChange,
		readonly: readonlyProp = false,
		ref = $bindable(null),
		required: requiredProp = false,
		searchPlaceholder,
		size,
		sourceTitle,
		style,
		targetTitle,
		value = $bindable(),
		virtual = false,
		virtualHeight = 256,
		virtualItemSize = 52,
		virtualOverscan = 4,
		...rest
	}: ZTransferComponentProps<TMode> = $props();
	const zui = useZui();
	const fieldOwner = claimZFieldControlOwner();
	const field = fieldOwner.field;
	const resolvedSize = $derived(resolveControlSize(size ?? field?.size, zui.density));
	const uid = $props.id();
	const idBase = $derived(createZuiId(zui.idPrefix, uid, 'transfer'));
	const disabled = $derived(disabledProp || (field?.disabled ?? false));
	const readonly = $derived(readonlyProp || (field?.readonly ?? false));
	const resolvedInvalid = $derived(invalid ?? field?.invalid ?? false);
	const resolvedRequired = $derived(requiredProp || (field?.required ?? false));
	const resolvedName = $derived(nameProp ?? field?.name);
	const resolvedControlId = $derived(controlIdProp ?? field?.controlId ?? `${idBase}-source-list`);
	const resolvedRootId = $derived(id ?? `${idBase}-root`);
	const resolvedDescribedBy = $derived(mergeAriaIds(ariaDescribedBy, field?.describedBy));
	const resolvedLabelledBy = $derived(mergeAriaIds(ariaLabelledBy, field?.labelId));
	const resolvedEmptyText = $derived(emptyText ?? zui.localePack.transfer.empty);
	const resolvedLoadingText = $derived(loadingText ?? zui.localePack.collection.loading);
	const resolvedMoveToSourceLabel = $derived(
		moveToSourceLabel ?? zui.localePack.transfer.moveToSource
	);
	const resolvedMoveToTargetLabel = $derived(
		moveToTargetLabel ?? zui.localePack.transfer.moveToTarget
	);
	const resolvedSearchPlaceholder = $derived(
		searchPlaceholder ?? zui.localePack.transfer.filterPlaceholder
	);
	const resolvedSourceTitle = $derived(sourceTitle ?? zui.localePack.transfer.sourceTitle);
	const resolvedTargetTitle = $derived(targetTitle ?? zui.localePack.transfer.targetTitle);
	function resolveMoveMode(): 'immediate' | 'request' {
		if (moveMode !== 'immediate' && moveMode !== 'request')
			throw new TypeError('ZTransfer moveMode must be immediate or request.');
		if (moveMode === 'request') {
			if (typeof onMoveRequest !== 'function')
				throw new TypeError('ZTransfer request mode requires onMoveRequest.');
			if (onValueChange !== undefined)
				throw new TypeError('ZTransfer request mode cannot use onValueChange.');
		} else if (onMoveRequest !== undefined) {
			throw new TypeError('ZTransfer immediate mode cannot use onMoveRequest.');
		}
		return moveMode;
	}
	const collection = $derived.by(() => {
		return new LogicalCollection<SelectionKey, TransferItem>(
			items,
			{
				disabled: (item) => item.disabled ?? false,
				key: (item) => item.key,
				textValue: (item) => item.label
			},
			{ name: 'ZTransfer items' }
		);
	});
	const valueState = new ControllableState<readonly SelectionKey[]>({
		defaultValue: () => normalizeKeys(defaultValue, 'ZTransfer defaultValue'),
		onChange: () => onValueChange,
		read: () => value,
		write: (next) => (value = next)
	});
	const resolvedValue = $derived(normalizeKeys(valueState.current, 'ZTransfer value'));
	const targetKeys = $derived(new Set(resolvedValue));
	const sourceFullView = $derived(
		collection.view({ include: (item) => !targetKeys.has(item.key) })
	);
	const targetFullView = $derived(collection.view({ include: (item) => targetKeys.has(item.key) }));
	let sourceQuery = $state('');
	let targetQuery = $state('');
	const filterCollator = $derived(
		new Intl.Collator(zui.locale, { sensitivity: 'base', usage: 'search' })
	);

	function localeContains(text: string, query: string): boolean {
		const source = [...text];
		const target = [...query];
		if (target.length === 0) return true;
		for (let index = 0; index <= source.length - target.length; index += 1) {
			if (
				filterCollator.compare(source.slice(index, index + target.length).join(''), query) === 0
			) {
				return true;
			}
		}
		return false;
	}

	function matches(item: TransferItem, query: string): boolean {
		if (!query) return true;
		return (
			filter ??
			((candidate, value) =>
				localeContains(`${candidate.label} ${candidate.description ?? ''}`, value))
		)(item, query);
	}

	const sourceView = $derived(
		collection.view({
			include: (item) => !targetKeys.has(item.key) && matches(item.value, sourceQuery.trim())
		})
	);
	const targetView = $derived(
		collection.view({
			include: (item) => targetKeys.has(item.key) && matches(item.value, targetQuery.trim())
		})
	);
	const orphanKeys = $derived(resolvedValue.filter((key) => collection.get(key) === undefined));
	const orphanText = $derived(
		orphanKeys.length === 0
			? undefined
			: zui.localePack.transfer.selectedNotLoaded(
					new Intl.NumberFormat(zui.locale).format(orphanKeys.length),
					orphanKeys.length
				)
	);
	let sourceChecked = $state<ReadonlySet<SelectionKey>>(new Set());
	let targetChecked = $state<ReadonlySet<SelectionKey>>(new Set());
	const sourceCheckedCount = $derived(
		sourceFullView.keys.filter((key) => sourceChecked.has(key)).length
	);
	const targetCheckedCount = $derived(
		targetFullView.keys.filter((key) => targetChecked.has(key)).length
	);
	let sourceActiveKey = $state<SelectionKey>();
	let targetActiveKey = $state<SelectionKey>();
	let sourceListRef = $state<HTMLDivElement | null>(null);
	let targetListRef = $state<HTMLDivElement | null>(null);
	interface TransferDragSnapshot {
		readonly candidate: TransferMoveCandidate;
		readonly root: HTMLDivElement | null;
	}
	interface PendingTransferMove {
		readonly candidate: TransferMoveCandidate;
		readonly controller: AbortController;
		readonly focusElement: Element | null;
		readonly focusKey: SelectionKey | undefined;
		readonly generation: number;
		readonly mode: 'immediate' | 'request';
		readonly origin: Side;
		readonly request: TransferMoveRequest;
		readonly root: HTMLDivElement;
		completed: boolean;
	}
	let live = true;
	let moveGeneration = 0;
	let pending = $state.raw<PendingTransferMove | null>(null);
	let announcement = $state('');
	let announcementId = $state(0);
	function resolvePhase(): 'idle' | 'pending' {
		switch (resolveMoveMode()) {
			case 'immediate':
			case 'request':
				return pending ? 'pending' : 'idle';
		}
	}
	const formatter = $derived(new Intl.NumberFormat(zui.locale));
	const sourceMounted = new MountedElements<SelectionKey>();
	const targetMounted = new MountedElements<SelectionKey>();
	const sourceNavigation = new CollectionNavigation<SelectionKey, TransferItem>({
		direction: () => zui.direction,
		disabled: () => disabled,
		loop: () => true,
		orientation: () => 'vertical',
		readActive: () => sourceActiveKey,
		view: () => sourceView,
		writeActive: (next) => (sourceActiveKey = next)
	});
	const targetNavigation = new CollectionNavigation<SelectionKey, TransferItem>({
		direction: () => zui.direction,
		disabled: () => disabled,
		loop: () => true,
		orientation: () => 'vertical',
		readActive: () => targetActiveKey,
		view: () => targetView,
		writeActive: (next) => (targetActiveKey = next)
	});
	const sourceVirtualBridge = createChoiceVirtualMountBridge(sourceMounted);
	const targetVirtualBridge = createChoiceVirtualMountBridge(targetMounted);
	const sourceActive = new ActiveDescendant({
		idBase: () => `${idBase}-source`,
		mounted: sourceMounted,
		navigation: sourceNavigation,
		virtualizer: sourceVirtualBridge
	});
	const targetActive = new ActiveDescendant({
		idBase: () => `${idBase}-target`,
		mounted: targetMounted,
		navigation: targetNavigation,
		virtualizer: targetVirtualBridge
	});
	const sourceSelection = new SelectionModel<SelectionKey, TransferItem>({
		collection: () => collection,
		mode: () => (disabled || readonly || pending ? 'none' : 'multiple'),
		read: () => new Set(sourceChecked),
		selectAllScope: () => 'view',
		view: () => sourceView,
		write: ({ selection }) => (sourceChecked = selectionKeys(selection, sourceView.keys))
	});
	const targetSelection = new SelectionModel<SelectionKey, TransferItem>({
		collection: () => collection,
		mode: () => (disabled || readonly || pending ? 'none' : 'multiple'),
		read: () => new Set(targetChecked),
		selectAllScope: () => 'view',
		view: () => targetView,
		write: ({ selection }) => (targetChecked = selectionKeys(selection, targetView.keys))
	});
	const sourceTypeahead = new Typeahead<SelectionKey>({ locale: () => zui.locale });
	const targetTypeahead = new Typeahead<SelectionKey>({ locale: () => zui.locale });
	const rootClass = $derived(zui.recipe(rootRecipe, { disabled, size: resolvedSize }));
	const controlsClass = $derived(zui.recipe(controlsRecipe));
	const effectiveDirection = $derived.by(() => {
		if (dir === 'ltr' || dir === 'rtl') return dir;
		return getElementDirection(ref, zui.direction);
	});
	const MoveToTargetIcon = $derived(effectiveDirection === 'rtl' ? ArrowLeft : ArrowRight);
	const MoveToSourceIcon = $derived(effectiveDirection === 'rtl' ? ArrowRight : ArrowLeft);
	const variables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(variables)));
	const transferDragDrop = new TransferDragDropAdapter<TransferDragSnapshot>({
		disabled: () => !dragDrop || !ref || disabled || readonly || pending !== null,
		keysFor: movingKeysFor,
		matchesSnapshot: (snapshot) =>
			ref === snapshot.root &&
			matchesTransferItemsSnapshot(items, snapshot.candidate) &&
			matchesTransferValueSnapshot(resolvedValue, snapshot.candidate.value),
		nonce: () => nonce,
		onDrop: ({ destination, focusKey, keys, source }) => {
			void requestTransferMove(destination, source, keys, focusKey);
		},
		snapshot: (side, movingKeys) =>
			Object.freeze({
				candidate: createTransferMoveCandidate({
					destination: side === 'source' ? 'target' : 'source',
					items,
					movingKeys,
					value: resolvedValue
				}),
				root: ref
			})
	});
	const dragContext = $derived<TransferDragDropContext | undefined>(
		dragDrop ? transferDragDrop.context : undefined
	);

	function paneRuntime(side: Side) {
		return side === 'source'
			? {
					active: sourceActive,
					selection: sourceSelection,
					typeahead: sourceTypeahead,
					view: () => sourceView
				}
			: {
					active: targetActive,
					selection: targetSelection,
					typeahead: targetTypeahead,
					view: () => targetView
				};
	}

	function movingKeysFor(side: Side, key?: SelectionKey): readonly SelectionKey[] {
		const checked = side === 'source' ? sourceChecked : targetChecked;
		const requested = key !== undefined && !checked.has(key) ? new Set([key]) : checked;
		const view = side === 'source' ? sourceFullView : targetFullView;
		return view.items
			.filter((item) => requested.has(item.key) && !item.disabled)
			.map((item) => item.key);
	}

	function handleListKey(event: KeyboardEvent, side: Side): void {
		if (event.defaultPrevented || isKeyboardComposing(event) || disabled) return;
		const runtime = paneRuntime(side);
		if (dragDrop && !readonly && !pending && event.altKey && !event.ctrlKey && !event.metaKey) {
			const intent = navigationIntent(
				event.key,
				'horizontal',
				getElementDirection(ref, effectiveDirection)
			);
			const destination =
				intent === 'next' ? 'target' : intent === 'previous' ? 'source' : undefined;
			if (destination !== undefined && destination !== side) {
				const key = runtime.active.activeKey;
				if (key === undefined) return;
				const movingKeys = movingKeysFor(side, key);
				if (movingKeys.length === 0) return;
				event.preventDefault();
				void requestTransferMove(destination, 'keyboard', movingKeys);
				return;
			}
		}
		if ((event.ctrlKey || event.metaKey) && event.key.toLocaleLowerCase() === 'a') {
			event.preventDefault();
			runtime.selection.selectAll();
			return;
		}
		if (event.key === 'Enter' || event.key === ' ') {
			const key = runtime.active.activeKey;
			if (key === undefined) return;
			event.preventDefault();
			runtime.selection.toggle(key);
			return;
		}
		if (runtime.active.handleKey(event)) return;
		const match = runtime.typeahead.search(
			event.key,
			runtime.view().items,
			runtime.active.activeKey
		);
		if (match !== undefined) {
			event.preventDefault();
			runtime.active.set(match, 'keyboard');
		}
	}

	function handleFilterKey(event: KeyboardEvent, side: Side): void {
		if (isKeyboardComposing(event) || disabled) return;
		if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
		const runtime = paneRuntime(side);
		const target = event.key === 'ArrowUp' ? runtime.view().last() : runtime.view().first();
		if (target === undefined) return;
		event.preventDefault();
		(side === 'source' ? sourceListRef : targetListRef)?.focus({ preventScroll: true });
		runtime.active.set(target, 'keyboard');
	}

	function announce(message: string): void {
		if (!live) return;
		announcement = message;
		announcementId += 1;
	}

	function destinationLabel(destination: Side): string {
		return destination === 'target' ? resolvedTargetTitle : resolvedSourceTitle;
	}

	function announcePending(entry: PendingTransferMove): void {
		const count = entry.request.movingKeys.length;
		announce(
			zui.localePack.transfer.pending(
				formatter.format(count),
				count,
				destinationLabel(entry.request.destination)
			)
		);
	}

	function announceTerminal(entry: PendingTransferMove, result: TransferMoveResult): void {
		const count = entry.request.movingKeys.length;
		const formattedCount = formatter.format(count);
		const label = destinationLabel(entry.request.destination);
		announce(
			result === 'accepted'
				? zui.localePack.transfer.accepted(formattedCount, count, label)
				: result === 'rejected'
					? zui.localePack.transfer.rejected(formattedCount, count, label)
					: result === 'error'
						? zui.localePack.transfer.error(formattedCount, count, label)
						: zui.localePack.transfer.cancelled(formattedCount, count, label)
		);
	}

	function sideActive(side: Side) {
		return side === 'source' ? sourceActive : targetActive;
	}

	function sideList(side: Side): HTMLDivElement | null {
		return side === 'source' ? sourceListRef : targetListRef;
	}

	function focusable(element: Element | null, root: HTMLDivElement): element is HTMLElement {
		return Boolean(
			element?.isConnected &&
			isDomHtmlElement(element) &&
			containsComposedNode(root, element) &&
			!element.matches(':disabled') &&
			!element.closest('[inert]')
		);
	}

	function meaningfulFocus(element: Element | null, root: HTMLDivElement): boolean {
		return Boolean(
			element &&
			element !== root.ownerDocument.body &&
			element !== root.ownerDocument.documentElement &&
			element.isConnected &&
			isDomHtmlElement(element) &&
			!element.matches(':disabled') &&
			!element.closest('[inert]')
		);
	}

	async function focusPane(
		side: Side,
		key: SelectionKey | undefined,
		entry: PendingTransferMove
	): Promise<void> {
		if (key !== undefined) {
			sideActive(side).set(key, 'programmatic');
			await tick();
			if (!live || moveGeneration !== entry.generation || ref !== entry.root) return;
			const current = getActiveElement(entry.root);
			if (meaningfulFocus(current, entry.root) && current !== entry.focusElement) return;
		}
		sideList(side)?.focus({ preventScroll: true });
	}

	async function restoreTerminalFocus(
		entry: PendingTransferMove,
		result: TransferMoveResult
	): Promise<void> {
		if (!live || moveGeneration !== entry.generation || ref !== entry.root || !ref?.isConnected)
			return;
		const current = getActiveElement(entry.root);
		if (meaningfulFocus(current, entry.root) && current !== entry.focusElement) return;
		if (result === 'accepted') {
			await focusPane(entry.request.destination, entry.focusKey, entry);
			return;
		}
		if (focusable(entry.focusElement, entry.root)) {
			entry.focusElement.focus({ preventScroll: true });
			return;
		}
		await focusPane(entry.origin, entry.focusKey, entry);
	}

	function reserveTerminal(entry: PendingTransferMove, abort: boolean): boolean {
		if (entry.completed) return false;
		entry.completed = true;
		if (abort && !entry.controller.signal.aborted) entry.controller.abort();
		if (pending === entry) pending = null;
		return true;
	}

	function clearAcceptedSelection(origin: Side, movingKeys: readonly SelectionKey[]): void {
		const moved = new Set<SelectionKey>(movingKeys);
		if (origin === 'source') {
			sourceChecked = new Set([...sourceChecked].filter((key) => !moved.has(key)));
			sourceSelection.resetTransient();
		} else {
			targetChecked = new Set([...targetChecked].filter((key) => !moved.has(key)));
			targetSelection.resetTransient();
		}
	}

	function publishTerminal(
		entry: PendingTransferMove,
		result: TransferMoveResult,
		error: unknown,
		restoreFocus: boolean
	): boolean {
		const accepted = result === 'accepted';
		if (accepted) clearAcceptedSelection(entry.origin, entry.request.movingKeys);
		if (live) {
			announceTerminal(entry, result);
			onMoveEnd?.(
				Object.freeze({
					request: entry.request,
					result,
					...(error === undefined ? {} : { error })
				})
			);
			if (restoreFocus) void tick().then(() => restoreTerminalFocus(entry, result));
		}
		return accepted;
	}

	function finish(
		entry: PendingTransferMove,
		result: TransferMoveResult,
		error?: unknown,
		restoreFocus = true
	): boolean {
		if (!reserveTerminal(entry, result === 'cancelled' || result === 'stale')) return false;
		return publishTerminal(entry, result, error, restoreFocus);
	}

	function snapshotFailure(entry: PendingTransferMove): 'cancelled' | 'stale' | undefined {
		if (disabled || readonly) return 'cancelled';
		if (resolveMoveMode() !== entry.mode) return 'cancelled';
		if (ref !== entry.root) return 'stale';
		if (!matchesTransferItemsSnapshot(items, entry.candidate)) return 'stale';
		const currentValue = value !== undefined ? value : resolvedValue;
		const original = matchesTransferValueEcho(currentValue, entry.candidate.value);
		const expected = matchesTransferValueEcho(currentValue, entry.candidate.nextValue);
		return original || expected ? undefined : 'stale';
	}

	async function requestTransferMove(
		destination: Side,
		source: TransferMoveSource,
		explicitKeys?: readonly SelectionKey[],
		focusKeyOverride?: SelectionKey
	): Promise<boolean> {
		if (!live || !ref || disabled || readonly || pending) return false;
		const mode = resolveMoveMode();
		const origin: Side = destination === 'target' ? 'source' : 'target';
		const movingKeys =
			explicitKeys === undefined
				? movingKeysFor(origin)
				: (() => {
						const requested = new Set<SelectionKey>(explicitKeys);
						const view = origin === 'source' ? sourceFullView : targetFullView;
						return view.items
							.filter((item) => requested.has(item.key) && !item.disabled)
							.map((item) => item.key);
					})();
		if (movingKeys.length === 0) return false;
		const currentValue =
			value !== undefined ? normalizeKeys(value, 'ZTransfer value') : resolvedValue;
		const candidate = createTransferMoveCandidate({
			destination,
			items,
			movingKeys,
			value: currentValue
		});
		if (matchesTransferValueSnapshot(candidate.nextValue, candidate.value)) return false;
		const Controller = ref.ownerDocument.defaultView?.AbortController;
		if (!Controller) return false;
		const controller = new Controller();
		const activeKey = focusKeyOverride ?? sideActive(origin).activeKey;
		const moving = new Set<SelectionKey>(candidate.movingKeys);
		const request = Object.freeze({
			destination: candidate.destination,
			movingKeys: candidate.movingKeys,
			nextValue: candidate.nextValue,
			signal: controller.signal,
			source,
			value: candidate.value
		}) satisfies TransferMoveRequest;
		const entry: PendingTransferMove = {
			candidate,
			completed: false,
			controller,
			focusElement: getActiveElement(ref),
			focusKey:
				activeKey !== undefined && moving.has(activeKey) ? activeKey : candidate.movingKeys[0],
			generation: (moveGeneration += 1),
			mode,
			origin,
			request,
			root: ref
		};
		pending = entry;
		announcePending(entry);
		if (entry.mode === 'immediate') {
			try {
				valueState.setFromUser(candidate.nextValue);
			} catch (error) {
				return finish(entry, 'error', error);
			}
			const invalid = snapshotFailure(entry);
			if (invalid) return finish(entry, invalid, undefined, invalid !== 'cancelled');
			return finish(
				entry,
				matchesTransferValueEcho(value !== undefined ? value : resolvedValue, candidate.nextValue)
					? 'accepted'
					: 'rejected'
			);
		}
		let callbackAccepted = false;
		let failed = false;
		let failure: unknown;
		try {
			const result = await onMoveRequest!(request);
			if (typeof result !== 'boolean')
				throw new TypeError('ZTransfer onMoveRequest must return a boolean.');
			callbackAccepted = result;
		} catch (error) {
			failed = true;
			failure = error;
		}
		await tick();
		if (!live || pending !== entry || entry.completed || controller.signal.aborted) return false;
		const invalid = snapshotFailure(entry);
		if (invalid) return finish(entry, invalid, undefined, invalid !== 'cancelled');
		if (failed) return finish(entry, 'error', failure);
		if (!callbackAccepted) return finish(entry, 'rejected');
		return finish(
			entry,
			matchesTransferValueEcho(value !== undefined ? value : resolvedValue, candidate.nextValue)
				? 'accepted'
				: 'rejected'
		);
	}

	function resetFromForm(): void {
		const entry = pending;
		const cancelled = entry ? reserveTerminal(entry, true) : false;
		valueState.reset();
		sourceChecked = new Set();
		targetChecked = new Set();
		sourceQuery = '';
		targetQuery = '';
		sourceSelection.resetTransient();
		targetSelection.resetTransient();
		sourceTypeahead.clear();
		targetTypeahead.clear();
		sourceNavigation.set(undefined, 'programmatic');
		targetNavigation.set(undefined, 'programmatic');
		if (entry && cancelled) publishTerminal(entry, 'cancelled', undefined, false);
	}

	function focusPrimaryControl(): void {
		if (disabled) return;
		sourceListRef?.focus({ preventScroll: true });
		sourceActive.reconcile();
	}

	const unregisterFocusOwner = fieldOwner.registerFocusOwner(focusPrimaryControl);
	onDestroy(() => {
		live = false;
		moveGeneration += 1;
		const entry = pending;
		if (entry) reserveTerminal(entry, true);
		transferDragDrop.destroy();
		unregisterFocusOwner();
	});
	$effect(() => {
		const currentItems = items.map((item) => ({ disabled: item.disabled, key: item.key }));
		const currentValue = resolvedValue;
		const currentRoot = ref;
		const unavailable = !dragDrop || disabled || readonly || pending !== null;
		void currentItems;
		void currentValue;
		void currentRoot;
		void unavailable;
		untrack(() => transferDragDrop.reconcile());
	});
	$effect(() => {
		void sourceQuery;
		sourceTypeahead.clear();
	});
	$effect(() => {
		void targetQuery;
		targetTypeahead.clear();
	});
	$effect(() => {
		const entry = pending;
		const currentItems = items.map((item) => ({
			disabled: item.disabled,
			key: item.key
		}));
		const currentValue = resolvedValue;
		const externalValue = value;
		const currentRoot = ref;
		const currentMode = resolveMoveMode();
		const unavailable = disabled || readonly;
		untrack(() => {
			if (!entry || entry.completed) return;
			if (unavailable) {
				finish(entry, 'cancelled', undefined, false);
				return;
			}
			if (currentMode !== entry.mode) {
				finish(entry, 'cancelled', undefined, false);
				return;
			}
			const ownerValue =
				entry.mode === 'request' && externalValue !== undefined ? externalValue : currentValue;
			const valueMatches =
				matchesTransferValueEcho(ownerValue, entry.candidate.value) ||
				matchesTransferValueEcho(ownerValue, entry.candidate.nextValue);
			if (
				currentRoot !== entry.root ||
				!matchesTransferItemsSnapshot(currentItems, entry.candidate) ||
				!valueMatches
			)
				finish(entry, 'stale', undefined, currentRoot === entry.root);
		});
	});
	$effect(() => {
		const keys = collection.full.keys;
		const movePending = pending !== null;
		sourceActive.prune(keys);
		targetActive.prune(keys);
		sourceActive.reconcile();
		targetActive.reconcile();
		if (movePending) return;

		const sourcePaneKeys = new Set(sourceFullView.keys);
		const targetPaneKeys = new Set(targetFullView.keys);
		const nextSource = new Set(
			[...sourceChecked].filter((key) => {
				const item = collection.get(key);
				return sourcePaneKeys.has(key) && item !== undefined && !item.disabled;
			})
		);
		const nextTarget = new Set(
			[...targetChecked].filter((key) => {
				const item = collection.get(key);
				return targetPaneKeys.has(key) && item !== undefined && !item.disabled;
			})
		);
		if (!equalSets(nextSource, sourceChecked)) {
			sourceChecked = nextSource;
			sourceSelection.resetTransient();
		}
		if (!equalSets(nextTarget, targetChecked)) {
			targetChecked = nextTarget;
			targetSelection.resetTransient();
		}
	});
</script>

<div
	{...rest}
	bind:this={ref}
	class={[rootClass, className]}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables }}
	id={resolvedRootId}
	dir={dir ?? zui.direction}
	{nonce}
	role="group"
	aria-busy={loading || pending ? true : ariaBusy}
	aria-disabled={disabled || undefined}
	aria-describedby={resolvedDescribedBy}
	aria-labelledby={resolvedLabelledBy}
	data-disabled={disabled || undefined}
	data-invalid={resolvedInvalid || undefined}
	data-loading={loading || undefined}
	data-state={resolvePhase()}
	data-readonly={readonly || undefined}
	data-size={resolvedSize}
>
	<TransferPane
		size={resolvedSize}
		active={sourceActive}
		bind:listRef={sourceListRef}
		bind:query={sourceQuery}
		checked={sourceChecked}
		checkedCount={sourceCheckedCount}
		controlId={resolvedControlId}
		describedBy={resolvedDescribedBy}
		{disabled}
		drag={dragContext}
		emptyText={resolvedEmptyText}
		{filterable}
		invalid={resolvedInvalid}
		label={resolvedSourceTitle}
		labelId={`${idBase}-source-title`}
		labelledBy={mergeAriaIds(resolvedLabelledBy, `${idBase}-source-title`) ??
			`${idBase}-source-title`}
		{loading}
		loadingText={resolvedLoadingText}
		onControllerChange={(controller: ChoiceVirtualController<SelectionKey> | null) =>
			sourceVirtualBridge.connect(controller, sourceActive.activeKey)}
		onFilterKeydown={(event) => handleFilterKey(event, 'source')}
		onListKeydown={(event) => handleListKey(event, 'source')}
		onToggle={(item) => sourceSelection.toggle(item.key)}
		pending={pending !== null}
		{readonly}
		required={resolvedRequired}
		searchPlaceholder={resolvedSearchPlaceholder}
		side="source"
		totalCount={sourceFullView.size}
		view={sourceView}
		{virtual}
		{virtualHeight}
		{virtualItemSize}
		{virtualOverscan}
	/>

	<div class={controlsClass} data-slot="controls">
		<ZButton
			size={resolvedSize}
			aria-label={resolvedMoveToTargetLabel}
			disabled={disabled || readonly || pending !== null || sourceChecked.size === 0}
			loading={pending?.request.destination === 'target'}
			onclick={() => void requestTransferMove('target', 'action')}
		>
			<MoveToTargetIcon aria-hidden="true" size="1em" />
		</ZButton>
		<ZButton
			size={resolvedSize}
			aria-label={resolvedMoveToSourceLabel}
			disabled={disabled || readonly || pending !== null || targetChecked.size === 0}
			loading={pending?.request.destination === 'source'}
			onclick={() => void requestTransferMove('source', 'action')}
			variant="outline"
		>
			<MoveToSourceIcon aria-hidden="true" size="1em" />
		</ZButton>
	</div>

	<TransferPane
		size={resolvedSize}
		active={targetActive}
		bind:listRef={targetListRef}
		bind:query={targetQuery}
		checked={targetChecked}
		checkedCount={targetCheckedCount}
		controlId={`${idBase}-target-list`}
		{disabled}
		drag={dragContext}
		emptyText={resolvedEmptyText}
		{filterable}
		invalid={false}
		label={resolvedTargetTitle}
		labelId={`${idBase}-target-title`}
		labelledBy={`${idBase}-target-title`}
		{loading}
		loadingText={resolvedLoadingText}
		onControllerChange={(controller: ChoiceVirtualController<SelectionKey> | null) =>
			targetVirtualBridge.connect(controller, targetActive.activeKey)}
		onFilterKeydown={(event) => handleFilterKey(event, 'target')}
		onListKeydown={(event) => handleListKey(event, 'target')}
		onToggle={(item) => targetSelection.toggle(item.key)}
		{orphanText}
		pending={pending !== null}
		{readonly}
		required={false}
		searchPlaceholder={resolvedSearchPlaceholder}
		side="target"
		totalCount={resolvedValue.length}
		view={targetView}
		{virtual}
		{virtualHeight}
		{virtualItemSize}
		{virtualOverscan}
	/>
</div>
<ZVisuallyHidden role="status" aria-live="polite" aria-atomic="true">
	{#key announcementId}{announcement}{/key}
</ZVisuallyHidden>
<FormValueBridge
	{disabled}
	{form}
	name={resolvedName}
	onReset={resetFromForm}
	value={resolvedValue}
/>
