<script lang="ts">
    import ZTooltip from '../src/components/compound/tooltip/ZTooltip.svelte';
    import ZTooltipContent from '../src/components/compound/tooltip/ZTooltipContent.svelte';
    import ZTooltipTrigger from '../src/components/compound/tooltip/ZTooltipTrigger.svelte';

    let {defaultOpen = false}: { defaultOpen?: boolean } = $props();
    let open = $state<boolean>();
    let changes = $state(0);
</script>

<ZTooltip {defaultOpen} bind:open closeDelay={0} delay={0} onOpenChange={() => (changes += 1)}>
    <ZTooltipTrigger data-testid="tooltip-trigger">Status</ZTooltipTrigger>
    <ZTooltipContent data-testid="tooltip-content">Healthy</ZTooltipContent>
</ZTooltip>
<output data-testid="tooltip-output">{open}:{changes}</output>
