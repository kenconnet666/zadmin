<script lang="ts">
	import { ZLink, ZStack, ZText } from '@zadmin/zui';
	let activations = $state(0);
</script>

<ZStack gap="medium">
	<ZStack direction="row" gap="large" wrap>
		<ZLink disabled external href="https://example.com" onclick={() => (activations += 1)}>
			不可用外部资源
		</ZLink>
		<ZLink href="#/components/empty" onclick={() => (activations += 1)}>可用资源</ZLink>
	</ZStack>
	<ZText tone="muted">激活次数 = {activations}；disabled anchor没有href且退出Tab顺序。</ZText>
</ZStack>
