<script lang="ts">
	import { ZAffix, ZScrollArea, ZStack, ZText } from '@zadmin/zui';
	let status = $state('未固定');
	let owner = $state<HTMLDivElement | null>(null);
</script>

<ZScrollArea
	bind:ref={owner}
	aria-label="Affix局部滚动示例"
	height="12rem"
	scrollbarGutter="stable"
>
	<div style="min-height: 32rem; padding: 1rem;">
		<ZAffix
			scrollContainer={owner}
			offsetTop={8}
			onAffixChange={(value) => (status = value ? '已固定' : '未固定')}
		>
			<ZStack direction="row" gap="small"><strong>局部 owner</strong><ZText>{status}</ZText></ZStack
			>
		</ZAffix>
		<p>滚动这个容器以观察状态回调与固定占位。</p>
		<div style="block-size: 24rem;" aria-hidden="true"></div>
	</div>
</ZScrollArea>
