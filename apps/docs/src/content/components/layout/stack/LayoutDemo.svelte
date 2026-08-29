<script module lang="ts">
	import { defineSlotRecipe } from '@zadmin/zui';

	const layoutRecipe = defineSlotRecipe(
		{
			slots: ['control', 'select', 'item'] as const,
			base: {
				control: (s) => {
					s.alignItems.center;
					s.display.flex;
					s.fontWeight._bold;
					s.gap._medium;
					s.marginBottom._large;
				},
				item: (s) => {
					s.backgroundColor._surface;
					s.borderColor._primary;
					s.borderRadius._medium;
					s.borderStyle.solid;
					s.borderWidth._hairline;
					s.color._primaryHover;
					s.minWidth.rem(5.5);
					s.paddingBlock._medium;
					s.paddingInline._large;
					s.textAlign.center;
				},
				select: (s) => {
					s.backgroundColor._canvas;
					s.borderColor._border;
					s.borderRadius._medium;
					s.borderStyle.solid;
					s.borderWidth._hairline;
					s.color._text;
					s.paddingBlock._small;
					s.paddingInline._medium;
				}
			},
			variants: {}
		},
		import.meta
	);
</script>

<script lang="ts">
	import { ZBox, ZStack, type ZStackDirection, useZui } from '@zadmin/zui';

	let direction = $state<ZStackDirection>('row');
	const zui = useZui();
	const classes = $derived(zui.slots(layoutRecipe));
</script>

<label class={classes.control}>
	<span>方向</span>
	<select class={classes.select} bind:value={direction}>
		<option value="row">row</option>
		<option value="column">column</option>
		<option value="row-reverse">row-reverse</option>
		<option value="column-reverse">column-reverse</option>
	</select>
</label>

<ZStack {direction} gap="small" wrap>
	{#each ['Alpha', 'Beta', 'Gamma'] as item (item)}
		<ZBox class={classes.item}>{item}</ZBox>
	{/each}
</ZStack>
