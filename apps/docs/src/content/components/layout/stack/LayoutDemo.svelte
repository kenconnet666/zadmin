<script module lang="ts">
	import { defineRecipe } from '@zadmin/zui';

	const itemRecipe = defineRecipe(
		{
			base: (s) => {
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
			variants: {}
		},
		import.meta
	);
</script>

<script lang="ts">
	import {
		ZBox,
		ZSelect,
		ZSelectContent,
		ZSelectItem,
		ZSelectTrigger,
		ZStack,
		ZText,
		type ZStackDirection,
		useZui
	} from '@zadmin/zui';

	let direction = $state<ZStackDirection>('row');
	const zui = useZui();
	const itemClass = $derived(zui.recipe(itemRecipe));

	function setDirection(value: string | number | undefined): void {
		switch (value) {
			case 'row':
			case 'column':
			case 'row-reverse':
			case 'column-reverse':
				direction = value;
		}
	}
</script>

<ZStack gap="large">
	<ZStack align="center" direction="row" gap="medium">
		<ZText weight="bold">方向</ZText>
		<ZSelect value={direction} onValueChange={setDirection}>
			<ZSelectTrigger aria-label="Stack方向" />
			<ZSelectContent>
				<ZSelectItem value="row">row</ZSelectItem>
				<ZSelectItem value="column">column</ZSelectItem>
				<ZSelectItem value="row-reverse">row-reverse</ZSelectItem>
				<ZSelectItem value="column-reverse">column-reverse</ZSelectItem>
			</ZSelectContent>
		</ZSelect>
	</ZStack>

	<ZStack {direction} gap="small" wrap>
		{#each ['Alpha', 'Beta', 'Gamma'] as item (item)}
			<ZBox class={itemClass}>{item}</ZBox>
		{/each}
	</ZStack>
</ZStack>
