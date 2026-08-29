<script lang="ts">
    import {ZButton, ZProvider, type IcssRuntime, type ZuiTheme} from '../src/entrypoints/index.js';
    import ContextProbe from './ContextProbe.svelte';

    interface Props {
        nestedTheme?: ZuiTheme;
        runtime: IcssRuntime;
        theme: ZuiTheme;
    }

    let {nestedTheme, runtime, theme}: Props = $props();
</script>

<ZProvider colorScheme="dark" direction="rtl" locale="zh-CN" {runtime} {theme}>
    <ZButton data-testid="outer-provider">Outer</ZButton>
    <ContextProbe id="outer-context"/>
    {#if nestedTheme}
        <ZProvider theme={nestedTheme}>
            <ZButton data-testid="inner-provider">Inner</ZButton>
            <ContextProbe id="inner-context"/>
        </ZProvider>
    {/if}
</ZProvider>
