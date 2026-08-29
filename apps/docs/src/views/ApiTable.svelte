<script module lang="ts">
    import {defineSlotRecipe} from '@zadmin/zui';

    const apiRecipe = defineSlotRecipe(
        {
            slots: ['root', 'title', 'description', 'scroll'] as const,
            base: {
                description: (s) => {
                    s.color._textMuted;
                    s.lineHeight._relaxed;
                    s.margin.raw('0.65rem 0 1rem');
                },
                root: (s) => s.scrollMarginTop.rem(5.5),
                scroll: (s) => {
                    s.backgroundColor._canvas;
                    s.borderColor._border;
                    s.borderRadius._medium;
                    s.borderStyle.solid;
                    s.borderWidth._hairline;
                    s.marginTop._large;
                    s.overflowX.auto;
                    s._selector('& table', (table) => {
                        table.borderCollapse.collapse;
                        table.fontSize._small;
                        table.width._full;
                    });
                    s._selector('& th, & td', (cell) => {
                        cell.borderBottomColor._border;
                        cell.borderBottomStyle.solid;
                        cell.borderBottomWidth._hairline;
                        cell.padding._medium;
                        cell.textAlign.left;
                        cell.verticalAlign.top;
                    });
                    s._selector('& th', (header) => {
                        header.backgroundColor._surface;
                        header.color._textMuted;
                        header.fontSize._small;
                        header.letterSpacing.em(0.06);
                        header.textTransform.uppercase;
                    });
                    s._selector('& tbody tr:last-child td', (cell) => cell.borderBottomWidth.px(0));
                    s._selector('& td code', (code) => {
                        code.color._primaryHover;
                        code.whiteSpace.nowrap;
                    });
                    s._media('(max-width: 48rem)', (mobile) =>
                        mobile._selector('& th, & td', (cell) => cell.minWidth.rem(8))
                    );
                },
                title: (s) => {
                    s.fontSize._xlarge;
                    s.letterSpacing.em(-0.03);
                    s.margin.px(0);
                }
            },
            variants: {}
        },
        import.meta
    );
</script>

<script lang="ts">
    import {useZui} from '@zadmin/zui';
    import type {ApiSection} from '../framework/component-doc.js';

    let {section}: { section: ApiSection } = $props();
    const zui = useZui();
    const classes = $derived(zui.slots(apiRecipe));
</script>

<section class={classes.root} id={`api-${section.title.toLowerCase()}`}>
    <h2 class={classes.title}>{section.title}</h2>
    {#if section.description}<p class={classes.description}>{section.description}</p>{/if}
    <!-- svelte-ignore a11y_no_noninteractive_tabindex (keyboard focus is required for horizontal scrolling) -->
    <div class={classes.scroll} role="region" aria-label={`${section.title} API表格`} tabindex="0">
        <table>
            <thead>
            <tr>
                <th>名称</th>
                <th>类型</th>
                <th>默认值</th>
                <th>特性</th>
                <th>说明</th>
            </tr>
            </thead>
            <tbody>
            {#each section.rows as row (row.name)}
                <tr>
                    <td><code>{row.name}</code></td>
                    <td><code>{row.type}</code></td>
                    <td><code>{row.default}</code></td>
                    <td
                    >{[row.required ? 'required' : '', row.bindable ? 'bindable' : '']
                        .filter(Boolean)
                        .join(' · ') || '—'}</td
                    >
                    <td>{row.description}</td>
                </tr>
            {/each}
            </tbody>
        </table>
    </div>
</section>
