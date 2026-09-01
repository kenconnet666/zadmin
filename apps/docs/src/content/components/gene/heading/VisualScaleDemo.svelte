<script lang="ts">
	import { ZHeading, ZStack, ZText } from '@zadmin/zui';
</script>

<ZStack gap="medium">
	<ZHeading level={2} size="xlarge">h2 · xlarge</ZHeading>
	<ZHeading level={2} size="large">h2 · large</ZHeading>
	<ZHeading level={2} size="medium">h2 · medium</ZHeading>
	<ZHeading level={2} size="small">h2 · small</ZHeading>
	<ZText tone="muted">四个标题拥有相同h2语义；size只改变Theme视觉token。</ZText>
</ZStack>
