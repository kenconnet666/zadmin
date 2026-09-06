<script module lang="ts">
	import { defineRecipe } from '@zadmin/zui';

	const itemRecipe = defineRecipe(
		{
			base: (s) => {
				s.backgroundColor._surface;
				s.borderColor._border;
				s.borderRadius._medium;
				s.borderStyle.solid;
				s.borderWidth._hairline;
				s.paddingBlock._small;
				s.paddingInline._medium;
				s.overflowWrap.anywhere;
			},
			variants: {}
		},
		import.meta
	);
</script>

<script lang="ts">
	import {
		ZLink,
		ZOverflowList,
		ZPopover,
		ZPopoverContent,
		ZPopoverTrigger,
		ZProvider,
		ZText,
		useZui
	} from '@zadmin/zui';

	const items = [
		{ key: 'home', label: 'الرئيسية' },
		{ key: 'workspace', label: 'مساحة العمل' },
		{ key: 'projects', label: 'المشاريع' },
		{ key: 'delivery', label: 'تفاصيل التسليم الحالية' }
	] as const;
	const zui = useZui();
	const itemClass = $derived(zui.recipe(itemRecipe));
	let open = $state(false);
</script>

<ZProvider direction="rtl" locale="ar-EG">
	<ZText weight="semibold">从起点折叠并保留当前项</ZText>
	<ZOverflowList
		as="ol"
		{items}
		itemKey={(item) => item.key}
		collapseFrom="start"
		pinnedKeys={['delivery']}
		maxVisibleItems={3}
		suspended={open}
	>
		{#snippet item(item)}
			<div class={itemClass}>
				<ZLink appearance="text" href={`/workspace/${item.key}`}>{item.label}</ZLink>
			</div>
		{/snippet}
		{#snippet overflow(state)}
			<ZPopover bind:open placement="bottom-start">
				<ZPopoverTrigger variant="ghost" aria-label="显示隐藏路径">…</ZPopoverTrigger>
				<ZPopoverContent aria-label="隐藏路径">
					{#each state.overflowItems as item (item.key)}
						<ZLink appearance="text" href={`/workspace/${item.key}`} onclick={() => (open = false)}
							>{item.label}</ZLink
						>
					{/each}
				</ZPopoverContent>
			</ZPopover>
		{/snippet}
	</ZOverflowList>
</ZProvider>
