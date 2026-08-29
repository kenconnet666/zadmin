<script lang="ts">
	import { ZStack, ZText } from '@zadmin/zui';
</script>

<ZStack gap="small">
	<ZText as="strong" size="large">Strong · large</ZText>
	<ZText tone="primary" weight="semibold">Primary semantic text</ZText>
	<ZText tone="muted" size="small">Muted supporting copy</ZText>
	<ZText tone="danger">Danger feedback text</ZText>
	<ZText class="truncate-demo" truncate>
		这是一段用于验证truncate行为的较长文本，组件不会改变原生文本元素的语义。
	</ZText>
</ZStack>

<style>
	:global(.truncate-demo) {
		display: block;
		max-width: 21rem;
	}
</style>
