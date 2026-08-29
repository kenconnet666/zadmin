<script module lang="ts">
	import { defineSlotRecipe } from '@zadmin/zui';

	const galleryRecipe = defineSlotRecipe(
		{
			slots: ['root', 'item'] as const,
			base: {
				item: (s) => {
					s.backgroundColor._canvas;
					s.borderColor._border;
					s.borderRadius._medium;
					s.borderStyle.solid;
					s.borderWidth._hairline;
					s.paddingBlock._large;
					s.paddingInline._medium;
				},
				root: (s) => {
					s.display.grid;
					s.gap._medium;
					s.gridTemplateColumns.raw('repeat(auto-fit, minmax(7rem, 1fr))');
				}
			},
			variants: {}
		},
		import.meta
	);
</script>

<script lang="ts">
	import { ZIcon, ZStack, ZText, iconManifest, useZui } from '@zadmin/zui';
	const zui = useZui();
	const classes = $derived(zui.slots(galleryRecipe));
</script>

<div class={classes.root}>
	{#each Object.keys(iconManifest) as name (name)}
		<ZStack class={classes.item} gap="small" align="center">
			<ZIcon name={name as keyof typeof iconManifest} label={name} size={28} />
			<ZText size="small" tone="muted">{name}</ZText>
		</ZStack>
	{/each}
</div>
