<script module lang="ts">
	import { defineSlotRecipe } from '@zadmin/zui';

	const searchRecipe = defineSlotRecipe(
		{
			layer: 'utilities',
			slots: ['trigger', 'label', 'shortcuts', 'dialog'] as const,
			base: {
				dialog: (s) => {
					s.maxWidth.rem(44);
					s.padding._medium;
				},
				label: (s) => {
					s.overflow.hidden;
					s.textOverflow.ellipsis;
					s.whiteSpace.nowrap;
				},
				shortcuts: (s) => {
					s.alignItems.center;
					s.display.flex;
					s.gap._xsmall;
					s.marginInlineStart.auto;
					s._media('(max-width: 48rem)', (mobile) => mobile.display.none);
				},
				trigger: (s) => {
					s.color._textMuted;
					s.justifyContent.start;
					s.minWidth.px(0);
					s.width._full;
					s._selector('& > [data-slot="content"]', (content) => content.width._full);
				}
			},
			variants: {}
		},
		import.meta
	);
</script>

<script lang="ts">
	import {
		ZButton,
		ZCommandPalette,
		ZIcon,
		ZKbd,
		ZText,
		useZui,
		type CommandActionEvent
	} from '@zadmin/zui';
	import { guideDocs } from '../content/guides.js';
	import {
		componentCategories,
		type ComponentCatalogManifestEntry
	} from '../framework/catalog-manifest.generated.js';
	import {
		createDocsCommandItems,
		type DocsCommandItem,
		type DocsSearchGuide
	} from '../framework/search.js';

	let { docs }: { readonly docs: readonly ComponentCatalogManifestEntry[] } = $props();
	const zui = useZui();
	const classes = $derived(zui.slots(searchRecipe));
	const categoryLabels = new Map<string, string>(
		componentCategories.map((category) => [category.id, category.label] as const)
	);
	const themeGuide = {
		eyebrow: 'THEME',
		id: 'theme',
		sections: [],
		summary: '实时验证主题、明暗模式、对比度、密度、动画与逻辑方向。',
		title: 'Theme Lab'
	} as const satisfies DocsSearchGuide;
	const searchGuides = [themeGuide, ...guideDocs] as const;
	const items = $derived(
		createDocsCommandItems(
			docs,
			searchGuides,
			(doc) => categoryLabels.get(doc.category) ?? doc.category
		)
	);
	let open = $state(false);
	let query = $state('');
	let triggerRef = $state<HTMLButtonElement | null>(null);

	function isEditingTarget(target: EventTarget | null): boolean {
		if (!target || typeof (target as Element).matches !== 'function') return false;
		return (target as Element).matches(
			'input, textarea, select, [contenteditable]:not([contenteditable="false"])'
		);
	}

	$effect(() => {
		const ownerDocument = triggerRef?.ownerDocument;
		if (!ownerDocument) return;
		const handleSlash = (event: KeyboardEvent) => {
			if (
				event.defaultPrevented ||
				event.repeat ||
				event.key !== '/' ||
				event.altKey ||
				event.ctrlKey ||
				event.metaKey ||
				event.shiftKey ||
				isEditingTarget(event.target)
			) {
				return;
			}
			event.preventDefault();
			open = true;
		};
		ownerDocument.addEventListener('keydown', handleSlash);
		return () => ownerDocument.removeEventListener('keydown', handleSlash);
	});

	function navigate(event: CommandActionEvent): void {
		const item = event.item as DocsCommandItem;
		const view = triggerRef?.ownerDocument.defaultView;
		if (view) view.location.hash = item.href;
	}
</script>

<ZButton
	bind:ref={triggerRef}
	aria-expanded={open}
	aria-haspopup="dialog"
	aria-keyshortcuts="/ Control+K Meta+K"
	aria-label="搜索组件与指南"
	class={classes.trigger}
	onclick={() => (open = true)}
	variant="secondary"
	size="medium"
>
	<ZIcon name="search" size={18} />
	<ZText class={classes.label} tone="muted" truncate>搜索组件与指南…</ZText>
	<span aria-hidden="true" class={classes.shortcuts} data-slot="search-shortcuts">
		<ZKbd>/</ZKbd>
		<ZKbd>Ctrl/⌘ K</ZKbd>
	</span>
</ZButton>
<ZCommandPalette
	bind:open
	bind:query
	class={classes.dialog}
	closeLabel="关闭搜索"
	description="搜索全部生产指南与组件文档；不可用条目不会执行导航。"
	emptyText="没有匹配的组件或指南"
	inputLabel="搜索组件与指南"
	{items}
	listLabel="文档搜索结果"
	onAction={navigate}
	placeholder="输入组件、API 或指南名称"
	shortcut={{ key: 'k', modKey: true }}
	shortcutTarget={triggerRef?.ownerDocument}
	showTrigger={false}
	title="搜索 ZUI 文档"
/>
