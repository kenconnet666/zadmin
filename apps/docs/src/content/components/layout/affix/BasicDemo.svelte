<script lang="ts">
	import { ZAffix, ZStack, ZText } from '@zadmin/zui';
</script>

<div style="min-height: 18rem; padding-block: 1rem;">
	<ZAffix offsetTop={8}
		><ZStack direction="row" gap="small"
			><strong>Sticky tools</strong><ZText tone="neutral">原生 sticky</ZText></ZStack
		></ZAffix
	>
	<p>滚动页面查看顶部偏移。内容保持在真实布局流中。</p>
	<div style="block-size: 12rem;" aria-hidden="true"></div>
</div>
