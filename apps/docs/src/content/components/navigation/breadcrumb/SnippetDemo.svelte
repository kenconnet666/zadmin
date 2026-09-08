<script module lang="ts">
	import { defineRecipe } from '@zadmin/zui';
	const iconRecipe = defineRecipe(
		{
			base: (s) => {
				s.inlineSize._small;
				s.blockSize._small;
				s.flexShrink(0);
			},
			variants: {}
		},
		import.meta
	);
</script>

<script lang="ts">
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import Folder from '@lucide/svelte/icons/folder';
	import { ZBreadcrumb, useZui, type BreadcrumbItem } from '@zadmin/zui';
	const zui = useZui();
	const iconClass = $derived(zui.recipe(iconRecipe));

	const items = [
		{ href: '/assets', key: 'assets', label: '素材库' },
		{ href: '/assets/brand', key: 'brand', label: '品牌资源' },
		{ current: true, key: 'logos', label: 'Logo' }
	] as const;
</script>

{#snippet item(entry: BreadcrumbItem)}
	<Folder aria-hidden="true" class={iconClass} /> {entry.label}
{/snippet}

{#snippet separator()}
	<ChevronRight aria-hidden="true" class={iconClass} />
{/snippet}

<ZBreadcrumb aria-label="素材位置" {item} {items} {separator} />
