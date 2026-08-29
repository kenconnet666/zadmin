<script module lang="ts">
    import {defineSlotRecipe} from '@zadmin/zui';

    const pageRecipe = defineSlotRecipe(
        {
            slots: [
                'layout',
                'article',
                'header',
                'eyebrow',
                'titleLine',
                'title',
                'status',
                'lead',
                'importLine',
                'sourceLink',
                'section',
                'demoSection',
                'sectionTitle',
                'accessibility',
                'accessibilityList',
                'toc',
                'tocTitle',
                'tocButton',
                'tocNested'
            ] as const,
            base: {
                article: (s) => s.minWidth.px(0),
                accessibility: (s) => {
                    s.backgroundColor._canvas;
                    s.borderColor._border;
                    s.borderRadius._large;
                    s.borderStyle.solid;
                    s.borderWidth._hairline;
                    s.padding._large;
                },
                accessibilityList: (s) => {
                    s.color._textMuted;
                    s.lineHeight._relaxed;
                    s.marginBottom.px(0);
                    s.paddingInlineStart._xlarge;
                },
                eyebrow: (s) => {
                    s.color._accent;
                    s.fontSize._small;
                    s.fontWeight._bold;
                    s.letterSpacing.em(0.12);
                    s.margin.raw('0 0 0.8rem');
                    s.textTransform.uppercase;
                },
                demoSection: (s) => s.paddingTop.rem(2),
                header: (s) => {
                    s.borderBottomColor._border;
                    s.borderBottomStyle.solid;
                    s.borderBottomWidth._hairline;
                    s.paddingBottom.rem(2);
                },
                importLine: (s) => {
                    s.marginTop._xlarge;
                    s.maxWidth.rem(46);
                },
                layout: (s) => {
                    s.display.grid;
                    s.gap.raw('clamp(2rem, 3vw, 3rem)');
                    s.gridTemplateColumns.raw('minmax(0, 64rem) minmax(10rem, 13rem)');
                    s.justifyContent.center;
                    s._media('(max-width: 78rem)', (tablet) =>
                        tablet.gridTemplateColumns.raw('minmax(0, 1fr)')
                    );
                },
                lead: (s) => {
                    s.display.block;
                    s.fontSize._large;
                    s.lineHeight._relaxed;
                    s.marginTop._large;
                    s.maxWidth.rem(52);
                },
                section: (s) => {
                    s.paddingTop.rem(4);
                    s.scrollMarginTop.rem(5.5);
                },
                sectionTitle: (s) => {
                    s.fontSize._xlarge;
                    s.letterSpacing.em(-0.03);
                    s.margin.px(0);
                },
                sourceLink: (s) => {
                    s.alignItems.center;
                    s.color._primaryHover;
                    s.display.inlineFlex;
                    s.fontSize._small;
                    s.fontWeight._semibold;
                    s.gap._small;
                    s.marginTop._large;
                    s.textDecoration.none;
                },
                status: (s) => {
                    s.backgroundColor._surface;
                    s.borderColor._accent;
                    s.borderRadius.rem(999);
                    s.borderStyle.solid;
                    s.borderWidth._hairline;
                    s.color._accent;
                    s.fontSize._small;
                    s.fontWeight._bold;
                    s.paddingBlock._xsmall;
                    s.paddingInline._medium;
                    s.textTransform.uppercase;
                },
                title: (s) => {
                    s.fontSize.raw('clamp(2.4rem, 4vw, 3.75rem)');
                    s.letterSpacing.em(-0.05);
                    s.lineHeight._compact;
                    s.margin.px(0);
                    s.textShadow._small;
                },
                titleLine: (s) => {
                    s.alignItems.center;
                    s.display.flex;
                    s.gap._large;
                },
                toc: (s) => {
                    s.backgroundColor._canvas;
                    s.borderColor._border;
                    s.borderRadius._large;
                    s.borderStyle.solid;
                    s.borderWidth._hairline;
                    s.boxShadow._small;
                    s.display.flex;
                    s.flexDirection.column;
                    s.gap._xsmall;
                    s.height.fitContent;
                    s.padding._large;
                    s.position.sticky;
                    s.top.rem(6);
                    s._media('(max-width: 78rem)', (tablet) => tablet.display.none);
                },
                tocButton: (s) => {
                    s.backgroundColor.transparent;
                    s.borderWidth.px(0);
                    s.color._textMuted;
                    s.cursor.pointer;
                    s.fontSize._small;
                    s.borderRadius._small;
                    s.paddingBlock._xsmall;
                    s.paddingInline._small;
                    s.textAlign.left;
                    s.textDecoration.none;
                    s._hover((hover) => hover.color._primaryHover);
                },
                tocNested: (s) => s.paddingInlineStart._medium,
                tocTitle: (s) => {
                    s.color._accent;
                    s.fontSize._small;
                    s.marginBottom._small;
                }
            },
            variants: {
                active: {
                    false: {},
                    true: {
                        tocButton: (s) => {
                            s.backgroundColor._surface;
                            s.color._primaryHover;
                            s.fontWeight._semibold;
                        }
                    }
                }
            },
            defaultVariants: {active: false}
        },
        import.meta
    );
</script>

<script lang="ts">
    import ExternalLink from '@lucide/svelte/icons/external-link';
    import {onMount} from 'svelte';
    import {ZStack, ZText, useZui} from '@zadmin/zui';
    import {ZCode} from '@zadmin/zui/code';
    import type {ComponentDoc} from '../framework/component-doc.js';
    import {componentRoute} from '../framework/router.js';
    import ApiTable from './ApiTable.svelte';
    import DemoBlock from './DemoBlock.svelte';

    let {doc}: { doc: ComponentDoc } = $props();
    let activeSection = $state('demos');
    const zui = useZui();
    const classes = $derived(zui.slots(pageRecipe));

    function tocButtonClass(id: string, nested = false) {
        const current = zui.slots(pageRecipe, {active: activeSection === id});
        return nested ? [current.tocButton, classes.tocNested] : current.tocButton;
    }

    onMount(() => {
        const ids = ['demos', ...doc.demos.map((demo) => demo.id), 'api', 'accessibility'];
        const observer = new IntersectionObserver(
            (entries) => {
                const visible = entries
                    .filter((entry) => entry.isIntersecting)
                    .sort((left, right) => left.boundingClientRect.top - right.boundingClientRect.top)[0];
                if (visible?.target.id) activeSection = visible.target.id;
            },
            {rootMargin: '-18% 0px -70% 0px', threshold: 0}
        );
        for (const id of ids) {
            const section = document.getElementById(id);
            if (section) observer.observe(section);
        }
        return () => observer.disconnect();
    });
</script>

<div class={classes.layout}>
    <article class={classes.article}>
        <header class={classes.header}>
            <p class={classes.eyebrow}>ZUI FOUNDATION</p>
            <div class={classes.titleLine}>
                <h1 class={classes.title}>{doc.name}</h1>
                <span class={classes.status}>{doc.status}</span>
            </div>
            <ZText class={classes.lead} tone="muted">{doc.summary}</ZText>
            <div class={classes.importLine}>
                <ZCode
                        ariaLabel={`${doc.name}导入语句`}
                        code={doc.importStatement}
                        inline
                        lang="typescript"
                />
            </div>
            <a
                    class={classes.sourceLink}
                    href={`https://github.com/kenconnet666/zadmin/blob/master/${doc.source}`}
            >
                <ExternalLink aria-hidden="true" size={15}/>
                查看组件源码
            </a>
        </header>

        <section id="demos" class={[classes.section, classes.demoSection]}>
            <h2 class={classes.sectionTitle}>实时演示</h2>
            <ZStack gap="large">
                {#each doc.demos as demo (demo.id)}
                    <DemoBlock {demo}/>
                {/each}
            </ZStack>
        </section>

        <section id="api" class={classes.section}>
            {#each doc.api as section (section.title)}
                <ApiTable {section}/>
            {/each}
        </section>

        <section id="accessibility" class={[classes.section, classes.accessibility]}>
            <h2 class={classes.sectionTitle}>可访问性</h2>
            <ul class={classes.accessibilityList}>
                {#each doc.accessibility as item (item)}
                    <li>{item}</li>
                {/each}
            </ul>
        </section>
    </article>

    <aside class={classes.toc} aria-label="当前页目录">
        <strong class={classes.tocTitle}>当前页面</strong>
        <a class={tocButtonClass('demos')} href={componentRoute(doc.id, 'demos')}>实时演示</a>
        {#each doc.demos as demo (demo.id)}
            <a class={tocButtonClass(demo.id, true)} href={componentRoute(doc.id, demo.id)}
            >{demo.title}</a
            >
        {/each}
        <a class={tocButtonClass('api')} href={componentRoute(doc.id, 'api')}>API</a>
        <a class={tocButtonClass('accessibility')} href={componentRoute(doc.id, 'accessibility')}
        >可访问性</a
        >
    </aside>
</div>
