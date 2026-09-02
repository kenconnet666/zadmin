<script module lang="ts">
	import { defineSlotRecipe } from '@zadmin/zui';

	const guideRecipe = defineSlotRecipe(
		{
			slots: [
				'root',
				'header',
				'eyebrow',
				'title',
				'lead',
				'sections',
				'section',
				'sectionTitle',
				'copy',
				'listItem',
				'links'
			] as const,
			base: {
				copy: (s) => s.lineHeight._relaxed,
				eyebrow: (s) => {
					s.color._primary;
					s.fontSize._small;
					s.fontWeight._bold;
					s.letterSpacing.em(0.12);
					s.margin.px(0);
					s.textTransform.uppercase;
				},
				header: (s) => {
					s.display.grid;
					s.gap._medium;
					s.marginBottom._xlarge;
				},
				lead: (s) => {
					s.fontSize._large;
					s.lineHeight._relaxed;
					s.maxWidth.rem(56);
				},
				links: (s) => {
					s.display.flex;
					s.flexWrap.wrap;
					s.gap._medium;
					s.marginTop._medium;
				},
				listItem: (s) => s.lineHeight._relaxed,
				root: (s) => s.maxWidth.rem(72),
				section: (s) => s.scrollMarginTop.rem(6),
				sections: (s) => {
					s.display.grid;
					s.gap._large;
				},
				sectionTitle: (s) => {
					s.fontSize._xlarge;
					s.letterSpacing.em(-0.02);
					s.margin.px(0);
				},
				title: (s) => {
					s.fontSize.raw('clamp(2.35rem, 5vw, 4.5rem)');
					s.letterSpacing.em(-0.05);
					s.lineHeight._compact;
					s.margin.px(0);
				}
			},
			variants: {}
		},
		import.meta
	);
</script>

<script lang="ts">
	import { ZCard, ZContainer, ZHeading, ZLink, ZList, ZStack, ZText, useZui } from '@zadmin/zui';
	import { ZCode } from '@zadmin/zui/code';
	import type { GuideDefinition } from '../content/guides.js';

	let { guide }: { guide: GuideDefinition } = $props();
	const zui = useZui();
	const classes = $derived(zui.slots(guideRecipe));
</script>

<article
	class={classes.root}
	aria-labelledby={`guide-${guide.id}`}
	data-doc-route={`guide:${guide.id}`}
>
	<ZContainer gutter="small" size="medium">
		<header class={classes.header}>
			<p class={classes.eyebrow}>{guide.eyebrow}</p>
			<ZHeading
				class={classes.title}
				data-doc-page-title="true"
				id={`guide-${guide.id}`}
				level={1}
				size="xlarge">{guide.title}</ZHeading
			>
			<ZText class={classes.lead} tone="muted">{guide.summary}</ZText>
		</header>

		<div class={classes.sections}>
			{#each guide.sections as section (section.id)}
				<ZCard
					as="section"
					aria-labelledby={`${section.id}-title`}
					class={classes.section}
					id={section.id}
				>
					{#snippet header()}
						<ZHeading
							class={classes.sectionTitle}
							id={`${section.id}-title`}
							level={2}
							size="xlarge">{section.title}</ZHeading
						>
					{/snippet}
					<ZStack gap="medium">
						{#each section.paragraphs as paragraph, index (`${section.id}-paragraph-${index}`)}
							<ZText as="p" class={classes.copy}>{paragraph}</ZText>
						{/each}
						{#if section.bullets}
							<ZList
								items={section.bullets.map((label, index) => ({
									key: `${section.id}-${index}`,
									label
								}))}
							>
								{#snippet item(entry)}<ZText class={classes.listItem}>{entry.label}</ZText
									>{/snippet}
							</ZList>
						{/if}
						{#if section.code}
							<ZCode
								ariaLabel={`${section.title}代码`}
								code={section.code}
								embedded
								lang={section.language}
								lineNumbers
							/>
						{/if}
						{#if section.links}
							<div class={classes.links}>
								{#each section.links as link (link.href)}
									<ZLink href={link.href}>{link.label}</ZLink>
								{/each}
							</div>
						{/if}
					</ZStack>
				</ZCard>
			{/each}
		</div>
	</ZContainer>
</article>
