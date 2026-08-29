<script lang="ts">
	import { ZIcon, ZStack, ZText, iconManifest } from '@zadmin/zui';
</script>

<div class="gallery">
	{#each Object.keys(iconManifest) as name (name)}
		<ZStack class="icon-item" gap="small" align="center">
			<ZIcon name={name as keyof typeof iconManifest} label={name} size={28} />
			<ZText size="small" tone="muted">{name}</ZText>
		</ZStack>
	{/each}
</div>

<style>
	.gallery {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(7rem, 1fr));
		gap: 0.75rem;
	}

	:global(.icon-item) {
		padding: 1rem 0.75rem;
		border: 1px solid var(--docs-border);
		border-radius: 0.75rem;
		background: var(--docs-surface);
	}
</style>
