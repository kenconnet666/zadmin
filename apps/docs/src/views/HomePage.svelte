<script module lang="ts">
    import {defineSlotRecipe} from '@zadmin/zui';

    const homeRecipe = defineSlotRecipe(
        {
            slots: [
                'hero',
                'eyebrow',
                'title',
                'copy',
                'primaryAction',
                'secondaryAction',
                'principles',
                'principle',
                'metric',
                'principleLabel',
                'principleCopy',
                'catalog',
                'catalogTitle',
                'group',
                'groupTitle',
                'grid',
                'card',
                'cardIcon',
                'cardTitle',
                'learnMore'
            ] as const,
            base: {
                card: (s) => {
                    s.backgroundColor._canvas;
                    s.borderColor._border;
                    s.borderRadius._large;
                    s.borderStyle.solid;
                    s.borderWidth._hairline;
                    s.boxShadow._small;
                    s.display.block;
                    s.padding._large;
                    s.textDecoration.none;
                    s.transitionDuration._fast;
                    s.transitionProperty.raw('transform, border-color, box-shadow');
                    s._hover((hover) => {
                        hover.borderColor._primary;
                        hover.boxShadow._medium;
                        hover.transform.raw('translateY(-2px)');
                    });
                },
                cardIcon: (s) => {
                    s.backgroundColor._surface;
                    s.borderRadius._medium;
                    s.color._accent;
                    s.display.grid;
                    s.height._medium;
                    s.placeItems.center;
                    s.width._medium;
                },
                cardTitle: (s) => {
                    s.fontSize._large;
                    s.margin.raw('1rem 0 0.6rem');
                },
                catalog: (s) => {
                    s.maxWidth.rem(72);
                    s.paddingTop.rem(6);
                },
                catalogTitle: (s) => {
                    s.fontSize._xlarge;
                    s.letterSpacing.em(-0.03);
                    s.margin.px(0);
                },
                copy: (s) => {
                    s.color._textMuted;
                    s.fontSize._large;
                    s.lineHeight._relaxed;
                    s.margin.raw('1.6rem 0 2rem');
                    s.maxWidth.rem(48);
                },
                eyebrow: (s) => {
                    s.color._accent;
                    s.fontSize._small;
                    s.fontWeight._bold;
                    s.letterSpacing.em(0.12);
                    s.margin.raw('0 0 0.8rem');
                    s.textTransform.uppercase;
                },
                grid: (s) => {
                    s.display.grid;
                    s.gap._large;
                    s.gridTemplateColumns.raw('repeat(3, minmax(0, 1fr))');
                    s.marginTop._xlarge;
                    s._media('(max-width: 68rem)', (tablet) =>
                        tablet.gridTemplateColumns.raw('repeat(2, minmax(0, 1fr))')
                    );
                    s._media('(max-width: 48rem)', (mobile) => mobile.gridTemplateColumns.raw('1fr'));
                },
                group: (s) => s.marginTop.rem(2.25),
                groupTitle: (s) => {
                    s.color._textMuted;
                    s.fontSize._small;
                    s.letterSpacing.em(0.08);
                    s.margin.px(0);
                    s.textTransform.uppercase;
                },
                hero: (s) => {
                    s.maxWidth.rem(65);
                    s.padding.raw('2rem 0 5rem');
                    s._media('(max-width: 48rem)', (mobile) => mobile.paddingTop.rem(1));
                },
                learnMore: (s) => {
                    s.color._primaryHover;
                    s.display.block;
                    s.fontSize._small;
                    s.fontWeight._semibold;
                    s.marginTop._large;
                },
                metric: (s) => {
                    s.color._primary;
                    s.display.block;
                    s.fontFamily._mono;
                    s.fontSize._xlarge;
                },
                primaryAction: (s) => {
                    s.backgroundColor._primary;
                    s.borderRadius._medium;
                    s.color._canvas;
                    s.display.inlineFlex;
                    s.fontWeight._semibold;
                    s.minHeight._medium;
                    s.paddingInline._large;
                    s.textDecoration.none;
                },
                principle: (s) => {
                    s.backgroundColor._canvas;
                    s.borderColor._border;
                    s.borderRadius._large;
                    s.borderStyle.solid;
                    s.borderWidth._hairline;
                    s.boxShadow._small;
                    s.padding._large;
                },
                principleCopy: (s) => {
                    s.color._textMuted;
                    s.lineHeight._relaxed;
                },
                principleLabel: (s) => {
                    s.display.block;
                    s.fontWeight._bold;
                    s.marginTop._large;
                },
                principles: (s) => {
                    s.display.grid;
                    s.gap._large;
                    s.gridTemplateColumns.raw('repeat(3, minmax(0, 1fr))');
                    s.maxWidth.rem(72);
                    s._media('(max-width: 48rem)', (mobile) => mobile.gridTemplateColumns.raw('1fr'));
                },
                secondaryAction: (s) => {
                    s.backgroundColor._canvas;
                    s.borderColor._border;
                    s.borderRadius._medium;
                    s.borderStyle.solid;
                    s.borderWidth._hairline;
                    s.display.inlineFlex;
                    s.fontWeight._semibold;
                    s.minHeight._medium;
                    s.paddingInline._large;
                    s.textDecoration.none;
                },
                title: (s) => {
                    s.fontSize.raw('clamp(2.55rem, 6vw, 5.2rem)');
                    s.letterSpacing.em(-0.06);
                    s.lineHeight(0.98);
                    s.margin.px(0);
                    s.textShadow._small;
                }
            },
            variants: {}
        },
        import.meta
    );
</script>

<script lang="ts">
    import {ZBox, ZIcon, ZStack, ZText, useZui} from '@zadmin/zui';
    import {componentCategories, type ComponentDoc} from '../framework/catalog.js';

    let {docs}: { docs: readonly ComponentDoc[] } = $props();
    const zui = useZui();
    const classes = $derived(zui.slots(homeRecipe));
</script>

<section class={classes.hero}>
    <p class={classes.eyebrow}>ZADMIN UI SYSTEM</p>
    <h1 class={classes.title}>看见组件，运行组件，复制真实源码。</h1>
    <p class={classes.copy}>
        ZUI是面向浏览器与WebView的Svelte
        5组件库。展示站直接运行工作区组件，每个示例的源码来自同一个Svelte文件。
    </p>
    <ZStack direction="row" gap="small" wrap>
        <a class={classes.primaryAction} href="#/components/button">开始浏览组件</a>
        <a
                class={classes.secondaryAction}
                href="https://github.com/kenconnet666/zadmin/tree/master/ui/zui">GitHub源码</a
        >
    </ZStack>
</section>

<section class={classes.principles} aria-label="设计原则">
    <article class={classes.principle}>
        <strong class={classes.metric}>{docs.length}</strong><span class={classes.principleLabel}
    >公开组件</span
    >
        <p class={classes.principleCopy}>只展示当前已经实现并通过验收的公开组件。</p>
    </article>
    <article class={classes.principle}>
        <strong class={classes.metric}>1:1</strong><span class={classes.principleLabel}>Demo与源码</span
    >
        <p class={classes.principleCopy}>页面运行的Svelte文件就是复制按钮提供的源码。</p>
    </article>
    <article class={classes.principle}>
        <strong class={classes.metric}>Typed</strong><span class={classes.principleLabel}>API合同</span>
        <p class={classes.principleCopy}>Props默认值来自组件单文件metadata，Docs不再维护第二份。</p>
    </article>
</section>

<section class={classes.catalog}>
    <header>
        <p class={classes.eyebrow}>FOUNDATIONS</p>
        <h2 class={classes.catalogTitle}>基础组件</h2>
    </header>
    {#each componentCategories as category (category.id)}
        {@const categoryDocs = docs.filter((doc) => doc.category === category.id)}
        <div class={classes.group}>
            <h3 class={classes.groupTitle}>{category.label}</h3>
            <div class={classes.grid}>
                {#each categoryDocs as doc (doc.id)}
                    <a class={classes.card} data-testid="component-card" href={`#/components/${doc.id}`}>
                        <ZBox>
                            <div class={classes.cardIcon}>
                                <ZIcon name="plus" size={18}/>
                            </div>
                            <h4 class={classes.cardTitle}>{doc.name}</h4>
                            <ZText tone="muted">{doc.summary}</ZText>
                            <span class={classes.learnMore}>查看Demo与API →</span>
                        </ZBox>
                    </a>
                {/each}
            </div>
        </div>
    {/each}
</section>
