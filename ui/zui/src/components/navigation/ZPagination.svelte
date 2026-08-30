<script module lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ZuiComponentMetadata } from '../../metadata/types.js';

	import { defineSlotRecipe, registerSlotRecipeHmr } from '../../recipes/slots.js';

	export interface ZPaginationProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
		readonly boundaryCount?: number;
		readonly defaultPage?: number;
		readonly disabled?: boolean;
		readonly onPageChange?: (page: number) => void;
		page?: number;
		ref?: HTMLElement | null;
		readonly siblingCount?: number;
		readonly totalPages: number;
	}

	const paginationRecipe = defineSlotRecipe(
		{
			slots: ['root', 'list', 'ellipsis'] as const,
			base: {
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
				root: (s) => s.display.block
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
			{ description: '真实nav元素引用。', name: 'ref', type: 'HTMLElement | null' }
		],
		dependencies: ['ZButton', 'pagination model', 'ControllableState'],
		events: [
			{
				description: '用户选择不同页码后调用一次。',
				name: 'onPageChange',
				type: '(page: number) => void'
			}
		],
		keyboard: [
			{ description: '在按钮间移动浏览器焦点。', key: 'Tab / Shift+Tab' },
			{ description: '激活当前页码或前后页。', key: 'Enter / Space' }
		],
		parts: [
			{ description: '页码按钮容器。', name: 'list' },
			{ description: '被裁剪页码区间。', name: 'ellipsis' }
		],
		props: [
			{
				default: '必填',
				description: '总页数，必须为正整数。',
				name: 'totalPages',
				required: true,
				type: 'number'
			},
			{
				bindable: true,
				default: 'undefined',
				description: '当前页码，从1开始。',
				name: 'page',
				type: 'number'
			},
			{ default: '1', description: '非受控模式初始页码。', name: 'defaultPage', type: 'number' },
			{
				default: '1',
				description: '首尾持续显示的页码数量。',
				name: 'boundaryCount',
				type: 'number'
			},
			{
				default: '1',
				description: '当前页两侧显示的页码数量。',
				name: 'siblingCount',
				type: 'number'
			},
			{ default: 'false', description: '禁用所有分页操作。', name: 'disabled', type: 'boolean' },
			{
				bindable: true,
				default: 'null',
				description: '真实nav元素引用。',
				name: 'ref',
				type: 'HTMLElement | null'
			}
		],
		since: '0.2.0',
		snippets: [],
		source: 'ui/zui/src/components/navigation/ZPagination.svelte',
		states: [{ description: '当前页码。', name: 'data-page', values: ['positive integer'] }],
		status: 'experimental',
		summary: '支持受控页码、稳定裁剪模型、locale数字与原生导航语义的分页组件。'
	} as const satisfies ZuiComponentMetadata;
</script>

<script lang="ts">
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import { untrack } from 'svelte';

	import { ControllableState } from '../../runtime/foundation/controllable-state.svelte.js';
	import { clampPage, createPaginationItems } from '../../runtime/pagination.js';
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
		disabled = false,
		onPageChange,
		page = $bindable(),
		ref = $bindable(null),
		siblingCount = 1,
		style,
		totalPages,
		...rest
	}: ZPaginationProps = $props();
	const zui = useZui();
	const pageState = new ControllableState<number>({
		defaultValue: () => clampPage(defaultPage, totalPages),
		onChange: () => onPageChange,
		read: () => page,
		write: (next) => (page = next)
	});
	const currentPage = $derived(clampPage(pageState.current, totalPages));
	const items = $derived(
		createPaginationItems(totalPages, currentPage, boundaryCount, siblingCount)
	);
	const classes = $derived(zui.slots(paginationRecipe));
	const numberFormat = $derived(new Intl.NumberFormat(zui.locale));
	const PreviousIcon = $derived(zui.direction === 'rtl' ? ChevronRight : ChevronLeft);
	const NextIcon = $derived(zui.direction === 'rtl' ? ChevronLeft : ChevronRight);
	const translate = (key: string, fallback: string) => zui.translations[key] ?? fallback;
	const icssVariables = $derived(readIcssCarrier(rest));
	const initialStyle = untrack(() => mergeStyles(style, serializeIcssVariables(icssVariables)));

	function select(nextPage: number): void {
		if (!disabled) pageState.setFromUser(clampPage(nextPage, totalPages));
	}
</script>

<nav
	{...rest}
	bind:this={ref}
	class={[classes.root, className]}
	style={initialStyle}
	use:applyIcssRootStyle={{ style, variables: icssVariables }}
	aria-label={ariaLabel ?? translate('pagination.label', 'Pagination')}
	data-page={currentPage}
>
	<div class={classes.list} data-slot="list">
		<ZButton
			aria-label={translate('pagination.previous', 'Previous page')}
			disabled={disabled || currentPage === 1}
			size="small"
			variant="secondary"
			onclick={() => select(currentPage - 1)}><PreviousIcon aria-hidden="true" size={16} /></ZButton
		>
		{#each items as item (item)}
			{#if typeof item === 'number'}
				<ZButton
					aria-current={item === currentPage ? 'page' : undefined}
					aria-label={translate('pagination.page', 'Page {page}').replace(
						'{page}',
						numberFormat.format(item)
					)}
					{disabled}
					size="small"
					variant={item === currentPage ? 'primary' : 'secondary'}
					onclick={() => select(item)}>{numberFormat.format(item)}</ZButton
				>
			{:else}
				<span aria-hidden="true" class={classes.ellipsis} data-slot="ellipsis">…</span>
			{/if}
		{/each}
		<ZButton
			aria-label={translate('pagination.next', 'Next page')}
			disabled={disabled || currentPage === totalPages}
			size="small"
			variant="secondary"
			onclick={() => select(currentPage + 1)}><NextIcon aria-hidden="true" size={16} /></ZButton
		>
	</div>
</nav>
