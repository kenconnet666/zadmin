<script lang="ts">
	import Rocket from '@lucide/svelte/icons/rocket';
	import { ZResult, ZStack } from '@zadmin/zui';
</script>

<ZStack direction="row" gap="large" wrap>
	<ZResult headingLevel={4} title="环境已就绪" tone="success">
		{#snippet icon()}<Rocket aria-hidden="true" size={52} strokeWidth={1.75} />{/snippet}
		自定义图标仍由Result统一隐藏，标题承担可访问名称。
	</ZResult>
	<ZResult headingLevel={4} icon={null} title="纯文本处理结果" tone="info">
		不需要图形时显式传入null，而不是渲染空SVG占位。
	</ZResult>
</ZStack>
