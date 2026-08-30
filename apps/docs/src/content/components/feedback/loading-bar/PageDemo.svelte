<script lang="ts">
	import { ZButton, ZLoadingBar, ZStack, ZText } from '@zadmin/zui';

	let page = $state(false);
</script>

<ZStack gap="medium">
	<ZButton size="small" variant="secondary" onclick={() => (page = !page)}>
		{page ? '停止页面进度' : '预览页面进度'}
	</ZButton>
	<ZText tone="muted">page = {page}；页面模式固定在逻辑视口顶部。</ZText>
	{#if page}<ZLoadingBar label="页面正在导航" page />{/if}
</ZStack>
