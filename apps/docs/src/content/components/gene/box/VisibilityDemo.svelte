<script lang="ts">
	import { ZBox, ZButton, ZStack, ZText } from '@zadmin/zui';

	let visible = $state(true);
</script>

<ZStack gap="medium">
	<ZButton size="small" variant="secondary" onclick={() => (visible = !visible)}>
		{visible ? '隐藏原生区域' : '显示原生区域'}
	</ZButton>
	<ZBox
		aria-label="部署详情区域"
		data-visible={visible}
		hidden={!visible}
		role="region"
		style="overflow-wrap: anywhere"
	>
		<ZText>deployment-production-with-an-intentionally-long-identifier</ZText>
	</ZBox>
	<ZText tone="muted">visible = {visible}；hidden和data属性直接属于同一个div。</ZText>
</ZStack>
