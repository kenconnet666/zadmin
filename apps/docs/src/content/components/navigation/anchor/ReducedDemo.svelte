<script lang="ts">
	import { ZAnchor, ZButton, ZProvider, ZScrollArea, ZStack, ZText } from '@zadmin/zui';

	const items = [
		{
			key: 'container-one',
			label: '容器第一段',
			href: '#anchor-container-one',
			targetId: 'anchor-container-one'
		},
		{
			key: 'container-two',
			label: '容器第二段',
			href: '#anchor-container-two',
			targetId: 'anchor-container-two'
		},
		{
			key: 'container-three',
			label: '容器第三段',
			href: '#anchor-container-three',
			targetId: 'anchor-container-three'
		}
	] as const;
	let reduced = $state(false);
	let scrollContainer = $state<HTMLDivElement | null>(null);
</script>

<ZProvider motion={reduced ? 'reduced' : 'full'}>
	<ZStack gap="small" style="max-width: 100%;">
		<ZButton size="small" variant="outline" onclick={() => (reduced = !reduced)}
			>motion={reduced ? 'reduced' : 'full'}</ZButton
		>
		<div
			style="display: grid; gap: 0.75rem; grid-template-columns: minmax(7rem, auto) minmax(0, 1fr); max-width: 100%;"
		>
			<ZAnchor
				aria-label="容器目录"
				{items}
				{scrollContainer}
				behavior={reduced ? 'auto' : 'smooth'}
				history={false}
			/>
			<ZScrollArea
				bind:ref={scrollContainer}
				aria-label="章节滚动容器"
				height="18rem"
				scrollbarGutter="stable"
				style="scroll-padding-block-start: 3rem;"
			>
				<ZStack gap="large" style="padding: 0.75rem;">
					<section
						id="anchor-container-one"
						style="scroll-margin-block-start: 3rem; min-height: 12rem;"
					>
						<ZText as="h3">容器第一段</ZText><ZText>Anchor可以绑定具名HTMLElement滚动容器。</ZText>
					</section>
					<section
						id="anchor-container-two"
						style="scroll-margin-block-start: 3rem; min-height: 12rem;"
					>
						<ZText as="h3">容器第二段</ZText><ZText>reduced motion下滚动立即完成。</ZText>
					</section>
					<section
						id="anchor-container-three"
						style="scroll-margin-block-start: 3rem; min-height: 12rem;"
					>
						<ZText as="h3">容器第三段</ZText>
					</section>
				</ZStack>
			</ZScrollArea>
		</div>
	</ZStack>
</ZProvider>
