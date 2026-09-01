<script lang="ts">
	import { ZBox, ZButton, ZStack, ZText } from '@zadmin/zui';

	let region: HTMLDivElement | null = $state(null);
</script>

<ZStack gap="medium">
	<ZBox
		bind:ref={region}
		aria-label="运行时状态"
		class="docs-box-native-marker"
		data-contract="native-forwarding"
		role="region"
		style="--docs-box-marker: forwarded"
		tabindex={0}
	>
		原生ARIA、tabindex、data、class、style与ref都转发到同一个div。
	</ZBox>
	<ZStack align="center" direction="row" gap="small" wrap>
		<ZButton size="small" variant="secondary" onclick={() => region?.focus()}>
			聚焦真实根元素
		</ZButton>
		<ZText tone="muted">
			ref = {region?.tagName ?? 'pending'} · class = {region?.classList.contains(
				'docs-box-native-marker'
			)
				? 'forwarded'
				: 'pending'} · style = {region?.style.getPropertyValue('--docs-box-marker') || 'pending'}
		</ZText>
	</ZStack>
</ZStack>
