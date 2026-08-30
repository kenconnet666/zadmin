<script lang="ts">
	import { ZBox, ZStack, ZText } from '@zadmin/zui';

	let region: HTMLDivElement | null = $state(null);
</script>

<ZStack gap="medium">
	<ZBox bind:ref={region} aria-label="运行时状态" role="region" tabindex="0">
		原生ARIA、tabindex、data属性与ref都转发到同一个div。
	</ZBox>
	<ZText tone="muted">ref = {region?.tagName ?? 'pending'}</ZText>
</ZStack>
