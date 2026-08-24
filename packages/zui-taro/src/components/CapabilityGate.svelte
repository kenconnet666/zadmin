<script lang="ts">
	import type { CapabilityGateProps } from './types.ts';

	let { children, fallback, status }: CapabilityGateProps = $props();
</script>

{#if status === 'available'}
	{@render children?.()}
{:else}
	{@render fallback?.(status)}
{/if}
