<script lang="ts">
	import Server from '@lucide/svelte/icons/server';
	import { ZProvider, ZStack, ZTag, ZText } from '@zadmin/zui';
</script>

<ZStack gap="medium">
	<ZStack align="center" direction="row" gap="medium" wrap>
		<ZTag size="small"><Server aria-hidden="true" size={12} />显式small</ZTag>
		<ZTag size="medium"><Server aria-hidden="true" size={14} />显式medium</ZTag>
	</ZStack>
	<ZProvider density="compact">
		<ZStack align="center" direction="row" gap="small" wrap>
			<ZTag>继承compact</ZTag>
			<ZTag size="medium" tone="accent">显式medium优先</ZTag>
		</ZStack>
	</ZProvider>
	<ZText tone="muted">size只控制有限token尺寸，不接受任意像素。</ZText>
</ZStack>
