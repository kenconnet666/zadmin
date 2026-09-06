<script lang="ts">
	import { ZBackTop, ZScrollArea, ZText } from '@zadmin/zui';
	let owner = $state<HTMLDivElement | null>(null);
</script>

<ZScrollArea bind:ref={owner} aria-label="BackTop局部滚动示例" height="12rem">
	<div style="min-height: 30rem; padding: 1rem;">
		<ZBackTop
			label="返回局部内容顶部"
			scrollContainer={owner}
			visibilityHeight={40}
			placement="start"
		/>
		<ZText>这个按钮只控制本容器，不修改文档页的Window滚动位置。</ZText>
		<div style="block-size: 24rem;" aria-hidden="true"></div>
	</div>
</ZScrollArea>
