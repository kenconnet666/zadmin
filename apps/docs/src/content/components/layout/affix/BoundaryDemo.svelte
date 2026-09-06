<script lang="ts">
	import { ZAffix, ZScrollArea, ZText } from '@zadmin/zui';
	let boundary = $state<HTMLDivElement | null>(null);
	let owner = $state<HTMLDivElement | null>(null);
</script>

<ZScrollArea bind:ref={owner} aria-label="Affix边界示例" height="12rem">
	<div bind:this={boundary} style="position: relative; min-height: 24rem; padding: 1rem;">
		<ZAffix scrollContainer={owner} offsetBottom={8} {boundary}
			><ZText>底部边界工具条</ZText></ZAffix
		>
		<div style="block-size: 18rem;" aria-hidden="true"></div>
	</div>
</ZScrollArea>
