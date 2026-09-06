<script lang="ts">
	import ArrowUp from '@lucide/svelte/icons/arrow-up';
	import { ZBackTop, ZText } from '@zadmin/zui';
</script>

<div style="min-height: 24rem; padding: 1rem;">
	<ZBackTop label="返回页面顶部" visibilityHeight={40} insetBlockEnd="small" insetInline="small">
		<ArrowUp aria-hidden="true" size={16} />
	</ZBackTop>
	<ZText>向下滚动页面，按钮超过40px后出现；示例使用真实button和原生滚动。</ZText>
	<div style="block-size: 20rem;" aria-hidden="true"></div>
</div>
