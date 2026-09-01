<script lang="ts">
	import ZHeading from '../src/components/gene/ZHeading.svelte';
	import ZText from '../src/components/gene/ZText.svelte';

	let headingRef = $state<HTMLHeadingElement | null>(null);
	let textRef = $state<HTMLElement | null>(null);
</script>

<ZHeading bind:ref={headingRef} data-testid="heading-h1" level={1} size="medium">
	Semantic title
</ZHeading>
<ZHeading data-testid="heading-h4-large" level={4} size="xlarge" tone="primary">
	Visual title
</ZHeading>
<ZText bind:ref={textRef} as="p" data-testid="text-clamp" lineClamp={2}>
	A long paragraph that is visually clamped to two lines while keeping its complete paragraph
	semantics.
</ZText>
<ZText data-testid="text-numbers" tabularNumbers>001284 · 0082 ms</ZText>
<ZText data-testid="text-truncate" truncate>Single line text</ZText>
<output data-testid="typography-ref-output">
	{headingRef?.tagName ?? 'none'}:{textRef?.tagName ?? 'none'}
</output>
