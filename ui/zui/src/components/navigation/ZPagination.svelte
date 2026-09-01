<script module lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';

	import { defineSlotRecipe, registerSlotRecipeHmr } from '../../recipes/slots.js';

	export type PaginationMode = 'compact' | 'default' | 'simple';

	export interface ZPaginationProps extends Omit<HTMLAttributes<HTMLElement>, 'children' | 'dir'> {
		readonly boundaryCount?: number;
		readonly defaultPage?: number;
		readonly defaultPageSize?: number;
		readonly disabled?: boolean;
		readonly dir?: 'ltr' | 'rtl';
		readonly mode?: PaginationMode;
		readonly onPageChange?: (page: number) => void;
		readonly onPageSizeChange?: (pageSize: number) => void;
		page?: number;
		pageSize?: number;
		readonly pageSizeOptions?: readonly number[];
		ref?: HTMLElement | null;
		readonly siblingCount?: number;
		readonly totalItems?: number;
		readonly totalPages?: number;
	}

	const paginationRecipe = defineSlotRecipe(
		{
			slots: [
				'root',
				'list',
				'ellipsis',
				'details',
				'status',
				'sizeLabel',
				'sizeSelect',
				'pageInput'
			] as const,
			base: {
				details: (s) => {
					s.alignItems.center;
					s.display.flex;
					s.flexWrap.wrap;
					s.gap._medium;
				},
				ellipsis: (s) => {
					s.color._textMuted;
					s.display.inlineFlex;
					s.justifyContent.center;
					s.minWidth._small;
				},
				list: (s) => {
					s.alignItems.center;
					s.display.flex;
					s.flexWrap.wrap;
					s.gap._small;
				},
				pageInput: (s) => {
					s.backgroundColor._canvas;
					s.borderColor._border;
					s.borderRadius._medium;
					s.borderStyle.solid;
					s.borderWidth._hairline;
					s.color._text;
					s.fontSize._small;
					s.minHeight._small;
					s.paddingInline._small;
					s.textAlign.center;
					s.width.rem(4);
					s._focusVisible((focus) => {
						focus.outlineColor._focus;
						focus.outlineOffset.px(2);
						focus.outlineStyle.solid;
						focus.outlineWidth._medium;
					});
				},
				root: (s) => {
					s.alignItems.center;
					s.display.flex;
					s.flexWrap.wrap;
					s.gap._large;
				},
				sizeLabel: (s) => {
					s.alignItems.center;
					s.color._textMuted;
					s.display.inlineFlex;
					s.fontSize._small;
					s.gap._small;
					s.whiteSpace.nowrap;
				},
				sizeSelect: (s) => {
					s.backgroundColor._canvas;
					s.borderColor._border;
					s.borderRadius._medium;
					s.borderStyle.solid;
					s.borderWidth._hairline;
					s.color._text;
					s.fontSize._small;
					s.minHeight._small;
					s.paddingInline._small;
					s._focusVisible((focus) => {
						focus.outlineColor._focus;
						focus.outlineOffset.px(2);
						focus.outlineStyle.solid;
						focus.outlineWidth._medium;
					});
				},
				status: (s) => {
					s.color._textMuted;
					s.fontSize._small;
					s.whiteSpace.nowrap;
				}
			},
			variants: {}
		},
		import.meta
	);

	registerSlotRecipeHmr(import.meta, paginationRecipe);

	export const zuiMetadata = {
		category: 'navigation',
		id: 'pagination',
		importStatement: "import { ZPagination } from '@zadmin/zui';",
		name: 'ZPagination',
		bindings: [
			{ description: '当前页码，从1开始。', name: 'page', type: 'number' },
			{ description: 'totalItems模式的每页条数。', name: 'pageSize', type: 'number' },
			{ description: '真实nav元素引用。', name: 'ref', type: 'HTMLElement | null' }
		],
		dependencies: ['ZButton', 'pagination model', 'ControllableState', 'Provider locale'],
		events: [
			{
				description: '用户选择不同页码后调用一次；外部总数收缩产生的静默夹紧不会伪造用户事件。',
				name: 'onPageChange',
				type: '(page: number) => void'
			},
			{
				description: '用户从原生每页条数选择器选择新值后调用一次。',
				name: 'onPageSizeChange',
				type: '(pageSize: number) => void'
			}
		],
		keyboard: [
			{ description: '在所有原生操作控件间移动焦点。', key: 'Tab / Shift+Tab' },
			{ description: '激活当前页码或前后页。', key: 'Enter / Space' },
			{
				description: '在可见分页按钮间按视觉方向移动焦点，RTL自动反转。',
				key: 'ArrowLeft / ArrowRight'
			},
			{ description: '移动到首个或末个可见分页按钮。', key: 'Home / End' },
			{ description: 'simple模式提交或恢复页码输入。', key: 'Enter / Escape' }
		],
		parts: [
			{ description: '页码按钮与紧凑状态容器。', name: 'list' },
			{ description: '被裁剪页码区间。', name: 'ellipsis' },
			{ description: '总条数和每页条数区域。', name: 'details' },
			{ description: '本地化页码或总条数状态。', name: 'status' },
			{ description: '原生每页条数选择器。', name: 'size-select' },
			{ description: 'simple模式原生页码输入。', name: 'page-input' }
		],
		props: [
			{
				default: '1（未传totalItems时）',
				description: '已由外部owner计算的总页数；不能与totalItems或页尺寸API同时使用。',
				name: 'totalPages',
				type: 'number'
			},
			{
				default: 'undefined',
				description: '非负总条数；组件只据此计算页数，不拥有请求或数据集合。',
				name: 'totalItems',
				type: 'number'
			},
			{
				bindable: true,
				default: 'undefined',
				description: '当前页码，从1开始；总数动态收缩时静默夹紧并写回binding。',
				name: 'page',
				type: 'number'
			},
			{ default: '1', description: '非受控模式初始页码。', name: 'defaultPage', type: 'number' },
			{
				bindable: true,
				default: 'undefined（内部10）',
				description: 'totalItems模式的正整数每页条数。',
				name: 'pageSize',
				type: 'number'
			},
			{
				default: '10',
				description: 'totalItems非受控模式初始每页条数。',
				name: 'defaultPageSize',
				type: 'number'
			},
			{
				default: 'undefined（不显示选择器）',
				description: '提供后显示原生每页条数选择器；受控自定义当前值会自动加入选项。',
				name: 'pageSizeOptions',
				type: 'readonly number[]'
			},
			{
				default: "'default'",
				description: '完整页码、可直接输入页码或只读紧凑状态。',
				name: 'mode',
				type: "'default' | 'simple' | 'compact'"
			},
			{
				default: '1',
				description: 'default模式首尾持续显示的页码数量。',
				name: 'boundaryCount',
				type: 'number'
			},
			{
				default: '1',
				description: 'default模式当前页两侧显示的页码数量。',
				name: 'siblingCount',
				type: 'number'
			},
			{
				default: 'false',
				description: '禁用所有分页与页尺寸操作。',
				name: 'disabled',
				type: 'boolean'
			},
			{
				default: 'Provider direction',
				description: '显式逻辑方向；同步布局、Lucide图标和方向键。',
				name: 'dir',
				type: "'ltr' | 'rtl'"
			},
			{
				bindable: true,
				default: 'null',
				description: '真实nav元素引用。',
				name: 'ref',
				type: 'HTMLElement | null'
			}
		],
		since: 'unreleased',
		snippets: [],
		source: 'ui/zui/src/components/navigation/ZPagination.svelte',
		states: [
			{ description: '当前页码。', name: 'data-page', values: ['positive integer'] },
			{ description: '解析后的总页数。', name: 'data-total-pages', values: ['positive integer'] },
			{
				description: '当前呈现模式。',
				name: 'data-mode',
				values: ['default', 'simple', 'compact']
			},
			{
				description: 'totalItems模式当前页尺寸。',
				name: 'data-page-size',
				values: ['positive integer']
			}
		],
		status: 'experimental',
		summary: '支持互斥页数/条目总量合同、受控页尺寸、紧凑呈现、RTL与原生导航语义的分页组件。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts">
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import { untrack } from 'svelte';

	import { ControllableState } from '../../runtime/foundation/controllable-state.svelte.js';
	import { createZuiId } from '../../runtime/foundation/ids.js';
	import { isDomHtmlElement, isDomNode } from '../../runtime/layer/dom-realm.js';
	import {
		clampPage,
		createPaginationItems,
		normalizePageSizeOptions,
		resolvePaginationModel
	} from '../../runtime/pagination.js';
	import {
		applyIcssRootStyle,
		mergeStyles,
		serializeIcssVariables
	} from '../../runtime/foundation/root-style.js';
	import { useZui } from '../../runtime/foundation/context.js';
	import { readIcssCarrier } from '../../runtime/foundation/compiler-bridge.js';
	import ZButton from '../gene/ZButton.svelte';

	let {
		'aria-label': ariaLabel,
		boundaryCount = 1,
		class: className,
		defaultPage = 1,
		defaultPageSize,
		dir,
		disabled = false,
		mode = 'default',
		onfocusin,
		onfocusout,
		onkeydown,
		onPageChange,
		onPageSizeChange,
		page = $bindable(),
		pageSize = $bindable(),
		pageSizeOptions,
		ref = $bindable(null),
		siblingCount = 1,
		style,
		totalItems,
		totalPages,
		...rest
	}: ZPaginationProps = $props();
	const zui = useZui();
	const uid = $props.id();
	const idBase = $derived(createZuiId(zui.idPrefix, uid, 'pagination'));
	const pageSizeState = new ControllableState<number>({
		defaultValue: () => defaultPageSize ?? 10,
		onChange: () => onPageSizeChange,
		read: () => pageSize,
		write: (next) => (pageSize = next)
	});
	const model = $derived.by(() => {
		if (
			totalItems === undefined &&
			(defaultPageSize !== undefined ||
				pageSize !== undefined ||
				pageSizeOptions !== undefined ||
				onPageSizeChange !== undefined)
		) {
			throw new TypeError('ZPagination page-size props require totalItems.');
		}
		return resolvePaginationModel({
			pageSize: totalItems === undefined ? undefined : pageSizeState.current,
			totalItems,
			totalPages
		});
	});
	const resolvedTotalPages = $derived(model.totalPages);
	const pageState = new ControllableState<number>({
		defaultValue: () => clampPage(defaultPage, resolvedTotalPages),
		onChange: () => onPageChange,
		read: () => page,
		write: (next) => (page = next)
	});
	const currentPage = $derived(clampPage(pageState.current, resolvedTotalPages));
	const items = $derived(
		mode === 'default'
			? createPaginationItems(resolvedTotalPages, currentPage, boundaryCount, siblingCount)
			: []
	);
	const resolvedPageSizeOptions = $derived.by(() => {
		if (pageSizeOptions === undefined) return [];
		if (totalItems === undefined) {
			throw new TypeError('ZPagination pageSizeOptions requires totalItems.');
		}
		return normalizePageSizeOptions(pageSizeOptions, model.pageSize ?? 10);
	});
	const classes = $derived(zui.slots(paginationRecipe));
	const numberFormat = $derived(new Intl.NumberFormat(zui.locale));
	const localePack = $derived(zui.localePack.pagination);
	const resolvedDirection = $derived(dir ?? zui.direction);
	const PreviousIcon = $derived(resolvedDirection === 'rtl' ? ChevronRight : ChevronLeft);
	const NextIcon = $derived(resolvedDirection === 'rtl' ? ChevronLeft : ChevronRight);
	const formattedPage = $derived(numberFormat.format(currentPage));
	const formattedTotalPages = $derived(numberFormat.format(resolvedTotalPages));
	const pageStatus = $derived(localePack.pageStatus(formattedPage, formattedTotalPages));
	const formattedTotalItems = $derived(
		model.totalItems === undefined ? undefined : numberFormat.format(model.totalItems)
	);
	const icssVariables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(icssVariables)));
	let pageInputRef = $state<HTMLInputElement | null>(null);
	let pageInputDraft = $state('');
	let pageInputEditing = $state(false);
	let lastFocusedControl: HTMLElement | null = null;

	function isButton(value: unknown): value is HTMLButtonElement {
		return isDomHtmlElement(value) && value.localName === 'button';
	}

	function select(nextPage: number): void {
		if (!disabled) pageState.setFromUser(clampPage(nextPage, resolvedTotalPages));
	}

	function changePageSize(event: Event & { currentTarget: HTMLSelectElement }): void {
		if (disabled || totalItems === undefined) return;
		const nextPageSize = Number(event.currentTarget.value);
		const previousPage = currentPage;
		pageSizeState.setFromUser(nextPageSize);
		const nextTotalPages = resolvePaginationModel({
			pageSize: nextPageSize,
			totalItems
		}).totalPages;
		const nextPage = clampPage(previousPage, nextTotalPages);
		if (nextPage !== previousPage) pageState.setFromUser(nextPage);
	}

	function beginPageInput(): void {
		pageInputEditing = true;
		pageInputDraft = String(currentPage);
		queueMicrotask(() => pageInputRef?.select());
	}

	function commitPageInput(control: HTMLInputElement): void {
		if (Number.isFinite(control.valueAsNumber)) select(control.valueAsNumber);
		pageInputDraft = String(currentPage);
	}

	function handlePageInputKeydown(
		event: KeyboardEvent & { currentTarget: HTMLInputElement }
	): void {
		switch (event.key) {
			case 'Enter':
				event.preventDefault();
				commitPageInput(event.currentTarget);
				event.currentTarget.select();
				break;
			case 'Escape':
				event.preventDefault();
				pageInputDraft = String(currentPage);
				event.currentTarget.select();
				break;
		}
	}

	function handleFocusIn(event: FocusEvent & { currentTarget: HTMLElement }): void {
		onfocusin?.(event);
		if (isDomHtmlElement(event.target)) lastFocusedControl = event.target;
	}

	function handleFocusOut(event: FocusEvent & { currentTarget: HTMLElement }): void {
		onfocusout?.(event);
		const target = isDomHtmlElement(event.target) ? event.target : null;
		const next = event.relatedTarget;
		if (next !== null && (!isDomNode(next) || !event.currentTarget.contains(next))) {
			lastFocusedControl = null;
			return;
		}
		if (next === null && target) {
			queueMicrotask(() => {
				if (
					lastFocusedControl === target &&
					target.isConnected &&
					ref &&
					!ref.contains(ref.ownerDocument.activeElement)
				) {
					lastFocusedControl = null;
				}
			});
		}
	}

	function handleKeydown(event: KeyboardEvent & { currentTarget: HTMLElement }): void {
		onkeydown?.(event);
		if (event.defaultPrevented) return;
		const target = event.target;
		if (!isButton(target) || !target.matches('[data-pagination-control]')) {
			return;
		}
		const controls = [
			...event.currentTarget.querySelectorAll<HTMLButtonElement>(
				'button[data-pagination-control]:not(:disabled)'
			)
		];
		const index = controls.indexOf(target);
		let nextIndex: number | undefined;
		switch (event.key) {
			case 'ArrowLeft':
				nextIndex = index + (resolvedDirection === 'rtl' ? 1 : -1);
				break;
			case 'ArrowRight':
				nextIndex = index + (resolvedDirection === 'rtl' ? -1 : 1);
				break;
			case 'Home':
				nextIndex = 0;
				break;
			case 'End':
				nextIndex = controls.length - 1;
				break;
			default:
				return;
		}
		const next = nextIndex === undefined ? undefined : controls[nextIndex];
		if (next) {
			event.preventDefault();
			next.focus({ preventScroll: true });
		}
	}

	$effect(() => {
		const normalizedPage = currentPage;
		if (!Object.is(pageState.current, normalizedPage)) page = normalizedPage;
		void disabled;
		void mode;
		void resolvedPageSizeOptions;
		void resolvedTotalPages;
		queueMicrotask(() => {
			if (!lastFocusedControl || lastFocusedControl.isConnected || !ref) return;
			const fallback =
				ref.querySelector<HTMLButtonElement>(`[data-page-number="${normalizedPage}"]`) ??
				ref.querySelector<HTMLButtonElement>('button[data-pagination-control]:not(:disabled)');
			fallback?.focus({ preventScroll: true });
			lastFocusedControl = fallback;
		});
	});
</script>

<nav
	{...rest}
	bind:this={ref}
	class={[classes.root, className]}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables: icssVariables }}
	aria-label={ariaLabel ?? localePack.label}
	dir={resolvedDirection}
	data-mode={mode}
	data-page={currentPage}
	data-page-size={model.pageSize}
	data-total-pages={resolvedTotalPages}
	onfocusin={handleFocusIn}
	onfocusout={handleFocusOut}
	onkeydown={handleKeydown}
>
	<div class={classes.list} data-slot="list">
		<ZButton
			aria-label={localePack.previous}
			data-pagination-control="previous"
			disabled={disabled || currentPage === 1}
			size="small"
			variant="secondary"
			onclick={() => select(currentPage - 1)}
		>
			<PreviousIcon aria-hidden="true" size={16} />
		</ZButton>
		{#if mode === 'default'}
			{#each items as item (item)}
				{#if typeof item === 'number'}
					<ZButton
						aria-current={item === currentPage ? 'page' : undefined}
						aria-label={item === currentPage
							? localePack.currentPage(numberFormat.format(item))
							: localePack.page(numberFormat.format(item))}
						data-page-number={item}
						data-pagination-control="page"
						{disabled}
						size="small"
						variant={item === currentPage ? 'primary' : 'secondary'}
						onclick={() => select(item)}>{numberFormat.format(item)}</ZButton
					>
				{:else}
					<span aria-hidden="true" class={classes.ellipsis} data-slot="ellipsis">…</span>
				{/if}
			{/each}
		{:else if mode === 'simple'}
			<input
				bind:this={pageInputRef}
				class={classes.pageInput}
				data-slot="page-input"
				id={`${idBase}-page-input`}
				type="number"
				inputmode="numeric"
				min={1}
				max={resolvedTotalPages}
				value={pageInputEditing ? pageInputDraft : currentPage}
				{disabled}
				aria-label={localePack.pageInput}
				aria-valuetext={pageStatus}
				onfocus={beginPageInput}
				oninput={(event) => (pageInputDraft = event.currentTarget.value)}
				onchange={(event) => commitPageInput(event.currentTarget)}
				onblur={(event) => {
					commitPageInput(event.currentTarget);
					pageInputEditing = false;
				}}
				onkeydown={handlePageInputKeydown}
			/>
			<span class={classes.status} data-slot="status" aria-hidden="true"
				>/ {formattedTotalPages}</span
			>
		{:else}
			<span class={classes.status} data-slot="status" aria-live="polite">{pageStatus}</span>
		{/if}
		<ZButton
			aria-label={localePack.next}
			data-pagination-control="next"
			disabled={disabled || currentPage === resolvedTotalPages}
			size="small"
			variant="secondary"
			onclick={() => select(currentPage + 1)}
		>
			<NextIcon aria-hidden="true" size={16} />
		</ZButton>
	</div>
	{#if formattedTotalItems !== undefined}
		<div class={classes.details} data-slot="details">
			<span class={classes.status} data-slot="status"
				>{localePack.totalItems(formattedTotalItems)}</span
			>
			{#if pageSizeOptions !== undefined && resolvedPageSizeOptions.length > 0}
				<label class={classes.sizeLabel}>
					<span>{localePack.itemsPerPage}</span>
					<select
						class={classes.sizeSelect}
						data-slot="size-select"
						id={`${idBase}-page-size`}
						{disabled}
						value={model.pageSize}
						onchange={changePageSize}
					>
						{#each resolvedPageSizeOptions as option (option)}
							<option value={option}>{numberFormat.format(option)}</option>
						{/each}
					</select>
				</label>
			{/if}
		</div>
	{/if}
</nav>
