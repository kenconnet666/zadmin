<script module lang="ts">
	import { defineSlotRecipe } from '@zadmin/zui';

	const demoRecipe = defineSlotRecipe(
		{
			layer: 'utilities',
			slots: ['root', 'item', 'preview', 'source'] as const,
			base: {
				root: (s) => s.scrollMarginTop.rem(5.5),
				item: (s) => s.borderBottomWidth.px(0),
				preview: (s) => {
					s.backgroundColor._surface;
					s.display.grid;
					s.alignContent.center;
					s.minHeight.rem(8);
					s.padding._xlarge;
					s._media('(max-width: 48rem)', (mobile) => mobile.padding._large);
				},
				source: (s) => {
					s.borderTopColor._border;
					s.borderTopStyle.solid;
					s.borderTopWidth._hairline;
				}
			},
			variants: {}
		},
		import.meta
	);
</script>

<script lang="ts">
	import {
		ZAccordion,
		ZAccordionItem,
		ZAccordionTrigger,
		ZAccordionContent,
		ZBox,
		ZCard,
		ZHeading,
		ZStack,
		ZText,
		useZui,
		type AccordionSingleValue
	} from '@zadmin/zui';
	import { ZCode } from '@zadmin/zui/code';
	import type { DemoDefinition } from '../framework/component-doc.js';

	let { demo }: { demo: DemoDefinition } = $props();
	let expanded = $state<AccordionSingleValue>(null);
	const source = $derived(demo.source.trim());
	const Demo = $derived(demo.component);
	const zui = useZui();
	const classes = $derived(zui.slots(demoRecipe));
	const sourceId = $derived(`source-${demo.id}`);
</script>

<ZAccordion bind:value={expanded}>
	<ZAccordionItem class={classes.item} value="source">
		<ZCard as="section" bodyPadding="none" class={classes.root} id={demo.id} variant="outlined">
			{#snippet header()}
				<ZStack align="start" direction="row" gap="large" justify="between" wrap>
					<ZStack gap="medium">
						<ZHeading level={3} size="large">{demo.title}</ZHeading>
						<ZText as="p" tone="muted" lineHeight="relaxed">{demo.description}</ZText>
					</ZStack>
					<ZAccordionTrigger appearance="inline" headingLevel={4}>
						{expanded === 'source' ? '收起源码' : '查看源码'}
					</ZAccordionTrigger>
				</ZStack>
			{/snippet}
			<ZBox class={classes.preview} data-testid={`demo-${demo.id}`}>
				<Demo />
			</ZBox>
			<ZAccordionContent class={classes.source} region={false}>
				<ZBox data-testid={sourceId} id={sourceId}>
					<ZCode
						ariaLabel={`${demo.title}源码`}
						code={source}
						copyable
						embedded
						lang="svelte"
						lineNumbers
					/>
				</ZBox>
			</ZAccordionContent>
		</ZCard>
	</ZAccordionItem>
</ZAccordion>
