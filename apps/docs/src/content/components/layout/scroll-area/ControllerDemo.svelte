<script module lang="ts">
	import { defineRecipe } from '@zadmin/zui';

	const contentRecipe = defineRecipe(
		{
			base: (s) => {
				s.display.grid;
				s.gap._small;
				s.padding._medium;
			},
			variants: {}
		},
		import.meta
	);
</script>

<script lang="ts">
	import {
		ZButton,
		ZScrollArea,
		ZStack,
		ZText,
		ZProvider,
		type ScrollAreaPosition,
		type ZScrollAreaController,
		useZui
	} from '@zadmin/zui';

	let controller = $state<ZScrollAreaController | null>(null);
	let motion = $state<'full' | 'reduced'>('full');
	let position = $state<ScrollAreaPosition>({ left: 0, top: 0 });
	const zui = useZui();
	const contentClass = $derived(zui.recipe(contentRecipe));

	function onPositionChange(next: ScrollAreaPosition): void {
		position = next;
	}
</script>

<ZProvider {motion}>
	<ZStack gap="medium">
		<ZStack align="center" direction="row" gap="small" wrap>
			<ZButton size="small" variant="outline" onclick={() => controller?.scrollBy({ top: 96 })}
				>向下滚动</ZButton
			>
			<ZButton size="small" variant="outline" onclick={() => controller?.scrollTo({ top: 0 })}
				>回到顶部</ZButton
			>
			<ZButton
				size="small"
				variant="outline"
				onclick={() => (motion = motion === 'full' ? 'reduced' : 'full')}
			>
				motion={motion}
			</ZButton>
		</ZStack>
		<ZText tone="muted">left={position.left}, top={position.top}</ZText>
		<ZScrollArea
			bind:controller
			aria-label="可控制消息列表"
			height="10rem"
			onScrollPositionChange={onPositionChange}
			scrollBehavior="smooth"
		>
			<div class={contentClass}>
				{#each Array.from({ length: 16 }, (_, index) => index + 1) as item (item)}
					<ZText>可控制项目 {item}</ZText>
				{/each}
			</div>
		</ZScrollArea>
	</ZStack>
</ZProvider>
