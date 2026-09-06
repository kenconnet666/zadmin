<script lang="ts">
	import ZAffix from '../src/components/layout/ZAffix.svelte';
	import ZBackTop from '../src/components/navigation/ZBackTop.svelte';
	import ZProvider from '../src/components/gene/ZProvider.svelte';

	let affixScroller = $state<HTMLDivElement | null>(null);
	let affixAncestor = $state<HTMLDivElement | null>(null);
	let affixBoundary = $state<HTMLDivElement | null>(null);
	let affixRoot = $state<HTMLDivElement | null>(null);
	let backTopScroller = $state<HTMLDivElement | null>(null);
	let affixChanges = $state<boolean[]>([]);
	let lastBehavior = $state('none');
	let scrollCalls = $state(0);
	let cancelledClicks = $state(0);
	const sizes = ['xsmall', 'small', 'medium', 'large', 'xlarge'] as const;

	$effect(() => {
		const scroller = backTopScroller;
		if (!scroller) return;
		const original = scroller.scrollTo.bind(scroller);
		scroller.scrollTo = (options?: ScrollToOptions | number, y?: number) => {
			scrollCalls += 1;
			if (typeof options === 'object') {
				lastBehavior = options.behavior ?? 'auto';
				scroller.scrollTop = options.top ?? scroller.scrollTop;
				scroller.scrollLeft = options.left ?? scroller.scrollLeft;
			} else {
				scroller.scrollLeft = options ?? 0;
				scroller.scrollTop = y ?? 0;
			}
			scroller.dispatchEvent(new Event('scroll'));
		};
		return () => {
			scroller.scrollTo = original;
		};
	});

	export function scrollAffix(top: number): void {
		if (!affixScroller) return;
		affixScroller.scrollTop = top;
		affixScroller.dispatchEvent(new Event('scroll'));
	}

	export function scrollAffixAncestor(top: number): void {
		if (!affixAncestor) return;
		affixAncestor.scrollTop = top;
		affixAncestor.dispatchEvent(new Event('scroll'));
	}

	export function scrollBackTop(top: number): void {
		if (!backTopScroller) return;
		backTopScroller.scrollTop = top;
		backTopScroller.dispatchEvent(new Event('scroll'));
	}
</script>

<div data-testid="native-sticky-owner" style="block-size: 6rem; overflow: auto;">
	<div style="block-size: 2rem;"></div>
	<ZAffix data-testid="native-affix" offsetTop={8}>
		<div data-testid="native-affix-content">Native sticky</div>
	</ZAffix>
	<div style="block-size: 20rem;"></div>
</div>

<div
	bind:this={affixAncestor}
	data-testid="affix-ancestor"
	style="block-size: 10rem; inline-size: 22rem; overflow: auto;"
>
	<div style="block-size: 2rem;"></div>
	<div
		bind:this={affixScroller}
		data-testid="affix-scroller"
		style="block-size: 8rem; inline-size: 20rem; overflow: auto; position: relative;"
	>
		<div style="block-size: 3rem;"></div>
		<div bind:this={affixBoundary} data-testid="affix-boundary" style="block-size: 24rem;">
			<div
				style="color: rgb(170, 20, 30); font-family: monospace; font-size: 11px; font-weight: 600; letter-spacing: 1px; line-height: 17px; transform: translateZ(0);"
			>
				<ZAffix
					bind:ref={affixRoot}
					boundary={affixBoundary}
					data-testid="projected-affix"
					offsetTop={6}
					onAffixChange={(next) => (affixChanges = [...affixChanges, next])}
					scrollContainer={affixScroller}
				>
					<div data-testid="projected-affix-content" style="inline-size: 100%;">
						Projected affix
					</div>
				</ZAffix>
			</div>
			<div style="block-size: 30rem;"></div>
		</div>
	</div>
	<div style="block-size: 24rem;"></div>
</div>

<div
	bind:this={backTopScroller}
	data-testid="back-top-scroller"
	style="block-size: 8rem; inline-size: 20rem; overflow: auto;"
>
	<div style="block-size: 60rem; inline-size: 30rem;"></div>
</div>

<ZProvider direction="rtl" motion="reduced">
	<ZBackTop
		data-testid="back-top-primary"
		dir="ltr"
		insetBlockEnd="medium"
		insetInline="large"
		label="Return to start"
		scrollContainer={backTopScroller}
		visibilityHeight={100}
	/>
	<ZBackTop
		data-testid="back-top-cancelled"
		label="Cancelled return"
		onclick={(event) => {
			cancelledClicks += 1;
			event.preventDefault();
		}}
		placement="end"
		scrollContainer={backTopScroller}
		visibilityHeight={100}
	/>
	{#each sizes as size, index}
		<ZBackTop
			data-testid={`back-top-${size}`}
			insetBlockEnd={80 + index * 64}
			label={`Back top ${size}`}
			scrollContainer={backTopScroller}
			{size}
			visibilityHeight={0}
		/>
	{/each}
</ZProvider>

<ZBackTop
	data-testid="back-top-full-motion"
	insetBlockEnd={96}
	label="Full motion return"
	scrollContainer={backTopScroller}
	visibilityHeight={100}
/>

<output data-testid="affix-output">{affixChanges.join(',')}:{affixRoot?.tagName ?? 'none'}</output>
<output data-testid="back-top-output">{lastBehavior}:{scrollCalls}:{cancelledClicks}</output>
